import {
  ArrowFunctionExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionExpression,
  Statement,
  VariableDeclarator,
} from "@swc/core";

import { webpackCall, loopOverModules, blankSpan } from "./ASTTemplates.js";
import {
  emitAssignmentExpression,
  emitBinaryExpression,
  emitCallExpression,
  emitComputedPropName,
  emitExpressionStatement,
  emitIdentifier,
  emitMemberExpression,
  emitNumericLiteral,
  emitOptionalChain,
  emitStringLiteral,
} from "./emitters.js";
import { MODULE_FIND_FUNC_NAMES } from "./constants.js";

const emitHlccAll = (name: string): VariableDeclarator => ({
  span: blankSpan,
  type: "VariableDeclarator",
  id: emitIdentifier(name),
  definite: false,
  init: emitMemberExpression(emitIdentifier("e"), emitIdentifier("c")),
});

const hlccByDNameTest = (
  varN: string,
  name: string
): [Expression, Statement] => [
  emitBinaryExpression(
    emitOptionalChain(emitIdentifier("mDef"), emitIdentifier("displayName")),
    emitStringLiteral(name),
    "==="
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
    emitMemberExpression(emitIdentifier("mDef"), emitIdentifier(prop));

  let expr: Expression = emitOptionalChain(
    emitIdentifier("mDef"),
    emitIdentifier(props[0])
  );

  for (const prop of props.slice(1))
    expr = emitBinaryExpression(expr, mProp(prop), "&&");

  return [
    expr ?? emitNumericLiteral(1),
    emitExpressionStatement(
      emitAssignmentExpression(emitIdentifier(varN), emitIdentifier("mDef"))
    ),
  ];
};

export default (
  moduleFinds: CallExpression[],
  func: ArrowFunctionExpression | FunctionExpression
): [ExpressionStatement, ExpressionStatement] => {
  const params = func.params.map((p) => {
    if (p.type === "Identifier") return p.value;
    throw new Error(
      "Params to your function must be identifiers, not " + p.type
    );
  });

  const variableDeclarations: VariableDeclarator[] = [];

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
        variableDeclarations.push(emitHlccAll(params[i]));
        break;
      case "hlccByDName":
        if (find.arguments[0].expression.type !== "StringLiteral")
          throw new Error(
            "Invalid display name argument - must be string literal"
          );
        variableDeclarations.push({
          span: blankSpan,
          type: "VariableDeclarator",
          definite: false,
          id: emitIdentifier(params[i]),
        });
        loopedTests.push(
          hlccByDNameTest(params[i], find.arguments[0].expression.value)
        );
        break;
      case "hlccByProps":
        if (find.arguments.some((a) => a.expression.type !== "StringLiteral"))
          throw new Error("all props must be string literals");

        variableDeclarations.push({
          span: blankSpan,
          type: "VariableDeclarator",
          definite: false,
          id: emitIdentifier(params[i]),
        });
        loopedTests.push(
          hlccByPropsTest(
            params[i],
            // are you serious?????
            // @ts-expect-error (2339)
            find.arguments.map((a) => a.expression.value)
          )
        );
        break;
    }
  }

  const funcBody =
    func.body.type === "BlockStatement"
      ? func.body
      : emitExpressionStatement(func.body);

  const statements: Statement[] = [
    {
      span: blankSpan,
      type: "VariableDeclaration",
      kind: "let",
      declare: false,
      declarations: variableDeclarations,
    },
    loopOverModules(loopedTests),
    funcBody,
  ];

  return [
    webpackCall(statements),
    emitExpressionStatement(
      emitCallExpression(
        emitMemberExpression(emitIdentifier("_w"), emitIdentifier("pop"))
      )
    ),
  ];
};
