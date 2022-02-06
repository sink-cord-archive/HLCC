import {
  ArrowFunctionExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionExpression,
  Identifier,
  Statement,
  VariableDeclaration,
} from "@swc/core";

import { webpackCall, popCall, loopOverModules } from "./ASTTemplates.js";
import {
  emitAssignmentExpression,
  emitBinaryExpression,
  emitCallExpression,
  emitExpressionStatement,
  emitIdentifier,
  emitMemberExpression,
  emitStringLiteral,
  emitVariableDeclaration,
} from "./emitters.js";
import { MODULE_FIND_FUNC_NAMES } from "./constants.js";

const emitHlccAll = (i: number): VariableDeclaration =>
  emitVariableDeclaration(
    "const",
    emitIdentifier(`_${i}`),
    emitMemberExpression(emitIdentifier("e"), emitIdentifier("c"))
  );

const hlccByDNameTest = (
  varN: string,
  name: string
): [Expression, Statement] => [
  emitBinaryExpression(
    emitIdentifier("mDef"),
    emitBinaryExpression(
      emitMemberExpression(
        emitIdentifier("mDef"),
        emitIdentifier("displayName")
      ),
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
    emitMemberExpression(emitIdentifier("mDef"), emitIdentifier(prop));

  let expr: Expression = emitIdentifier("mDef");

  for (const prop of props)
    expr = emitBinaryExpression(expr, mProp(prop), "&&");

  return [
    expr,
    emitExpressionStatement(
      emitAssignmentExpression(emitIdentifier(varN), emitIdentifier("mDef"))
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

  statements.push(loopOverModules(loopedTests));

  const props: Identifier[] = [];
  for (let i = 0; i < moduleFinds.length; i++)
    props.push(emitIdentifier(`_${i}`));

  statements.push(emitExpressionStatement(emitCallExpression(func, ...props)));

  return [webpackCall(statements), popCall];
};
