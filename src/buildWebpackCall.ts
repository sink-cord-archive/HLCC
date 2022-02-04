import {
  ArrowFunctionExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  ForOfStatement,
  FunctionExpression,
  Statement,
  VariableDeclaration,
} from "@swc/core";

import { webpackCall, popCall, blankSpan } from "./ASTTemplates.js";
import {
  emitAssignmentExpression,
  emitBinaryExpression,
  emitBlockStatement,
  emitCallExpression,
  emitExpressionStatement,
  emitIdentifier,
  emitIfStatement,
  emitMemberExpression,
  emitVariableDeclaration,
} from "./emitters.js";
import { MODULE_FIND_FUNC_NAMES } from "./constants.js";

const emitHlccAll = (i: number): VariableDeclaration =>
  emitVariableDeclaration(
    "const",
    emitIdentifier(`_${i}`),
    emitMemberExpression(emitIdentifier("e"), emitIdentifier("c"))
  );

const emitLoopOverModules = (
  i: number,
  tests: [Expression, Statement][]
): ForOfStatement => ({
  span: blankSpan,
  type: "ForOfStatement",
  await: blankSpan,
  left: emitVariableDeclaration("const", emitIdentifier("m")),
  right: emitCallExpression(
    emitMemberExpression(emitIdentifier("Object"), emitIdentifier("values")),
    emitMemberExpression(emitIdentifier("e"), emitIdentifier("c"))
  ),
  body: emitBlockStatement(
    ...tests.map(([t, s]): Statement => emitIfStatement(t, s))
  ),
});

const hlccByDNameTest = (
  varN: string,
  name: string
): [Expression, Statement] => [
  {
    span: blankSpan,
    type: "BinaryExpression",
    // todo optional chaining
    left: emitMemberExpression(
      emitMemberExpression(
        emitMemberExpression(emitIdentifier("m"), emitIdentifier("exports")),
        emitIdentifier("default")
      ),
      emitIdentifier("displayName")
    ),
    right: {
      span: blankSpan,
      type: "StringLiteral",
      has_escape: false,
      value: name,
    },
    operator: "===",
  },
  emitExpressionStatement(
    emitAssignmentExpression(emitIdentifier(varN), emitIdentifier("m"))
  ),
];

const hlccByPropsTest = (
  varN: string,
  props: string[]
): [Expression, Statement] => {
  const mExportsDefault = (prop: string) =>
    emitMemberExpression(
      emitMemberExpression(
        emitMemberExpression(emitIdentifier("m"), emitIdentifier("exports")),
        emitIdentifier("default")
      ),
      emitIdentifier(prop)
    );

  // like worse optional chaining
  let expr = emitBinaryExpression(
    emitIdentifier("m"),
    emitBinaryExpression(
      emitMemberExpression(emitIdentifier("m"), emitIdentifier("exports")),
      emitMemberExpression(
        emitMemberExpression(emitIdentifier("m"), emitIdentifier("exports")),
        emitIdentifier("default")
      ),
      "&&"
    ),
    "&&"
  );

  for (const prop of props)
    expr = emitBinaryExpression(mExportsDefault(prop), expr, "&&");

  return [
    expr,
    emitExpressionStatement(
      emitAssignmentExpression(emitIdentifier(varN), emitIdentifier("m"))
    ),
  ];
};

export default (
  moduleFinds: CallExpression[],
  func: ArrowFunctionExpression | FunctionExpression
): [ExpressionStatement, ExpressionStatement] => {
  const statements: Statement[] = [];

  const loopedTests: [Expression, Statement][] = [];

  for (let i = 0; i < moduleFinds.length; i++) {
    const find = moduleFinds[i];

    if (
      find.callee.type !== "Identifier" ||
      !MODULE_FIND_FUNC_NAMES.includes(find.callee.value)
    )
      throw new Error("Invalid module find type");

    switch (find.callee.value) {
      case "hlccAll":
        statements.push(emitHlccAll(i));
        break;
      case "hlccByDName":
        if (find.arguments[0].expression.type !== "StringLiteral")
          throw new Error(
            "Invalid display name argument - must be string literal"
          );
        loopedTests.push(
          hlccByDNameTest(`_${i}`, find.arguments[0].expression.value)
        );
        statements.push(
          emitVariableDeclaration("let", emitIdentifier(`_${i}`))
        );
        break;
      case "hlccByProps":
        if (find.arguments.some((a) => a.expression.type !== "StringLiteral"))
          throw new Error("all props must be string literals");

        loopedTests.push(
          hlccByPropsTest(
            `_${i}`,
            // are you serious?????
            // @ts-expect-error (2339)
            find.arguments.map((a) => a.expression.value)
          )
        );

        statements.push(
          emitVariableDeclaration("let", emitIdentifier(`_${i}`))
        );
        break;
    }
  }

  statements.push(emitCallExpression(func, /* pass all props here */));

  return [webpackCall(statements), popCall];
};
