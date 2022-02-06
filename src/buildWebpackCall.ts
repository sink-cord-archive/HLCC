import {
  ArrowFunctionExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  ForOfStatement,
  FunctionExpression,
  Identifier,
  Statement,
  VariableDeclaration,
  ForInStatement,
} from "@swc/core";

import {
  webpackCall,
  popCall,
  blankSpan,
  generateModuleList,
} from "./ASTTemplates.js";
import {
  emitAssignmentExpression,
  emitBinaryExpression,
  emitBlockStatement,
  emitCallExpression,
  emitComputedPropName,
  emitExpressionStatement,
  emitIdentifier,
  emitIfStatement,
  emitMemberExpression,
  emitStringLiteral,
  emitVariableDeclaration,
} from "./emitters.js";
import { MODULE_FIND_FUNC_NAMES } from "./constants.js";

const emitHlccAll = (i: number): VariableDeclaration =>
  emitVariableDeclaration(
    "const",
    emitIdentifier(`_${i}`),
    emitIdentifier("_mod")
  );

const loopOverModules = (tests: [Expression, Statement][]): ForInStatement => ({
  span: blankSpan,
  type: "ForInStatement",
  left: emitVariableDeclaration("const", emitIdentifier("k")),
  right: emitIdentifier("_mod"),
  body: emitBlockStatement(
    emitVariableDeclaration(
      "const",
      emitIdentifier("m"),
      emitMemberExpression(
        emitIdentifier("_mod"),
        emitComputedPropName(emitIdentifier("k"))
      )
    ),
    ...tests.map(([t, s]): Statement => emitIfStatement(t, s))
  ),
});

const hlccByDNameTest = (
  varN: string,
  name: string
): [Expression, Statement] => [
  emitBinaryExpression(
    emitIdentifier("m"),
    emitBinaryExpression(
      emitMemberExpression(emitIdentifier("m"), emitIdentifier("displayName")),
      emitStringLiteral(name),
      "==="
    ),
    "&&"
  ),
  emitExpressionStatement(
    emitAssignmentExpression(emitIdentifier(varN), emitIdentifier("m"))
  ),
];

const hlccByPropsTest = (
  varN: string,
  props: string[]
): [Expression, Statement] => {
  const mProp = (prop: string) =>
    emitMemberExpression(emitIdentifier("m"), emitIdentifier(prop));

  let expr: Expression = emitIdentifier("m");

  for (const prop of props)
    expr = emitBinaryExpression(expr, mProp(prop), "&&");

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
  const statements: Statement[] = [...generateModuleList];

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

  statements.push(loopOverModules(loopedTests));

  const props: Identifier[] = [];
  for (let i = 0; i < moduleFinds.length; i++)
    props.push(emitIdentifier(`_${i}`));

  statements.push(emitExpressionStatement(emitCallExpression(func, ...props)));

  return [webpackCall(statements), popCall];
};
