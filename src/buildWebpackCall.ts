import {
  CallExpression,
  Expression,
  ExpressionStatement,
  Statement,
} from "@swc/core";

import { webpackCall, popCall, loopOverModules } from "./ASTTemplates.js";
import {
  emitAssignmentExpression,
  emitBinaryExpression,
  emitComputedPropName,
  emitExpressionStatement,
  emitIdentifier,
  emitMemberExpression,
  emitNumericLiteral,
  emitStringLiteral,
} from "./emitters.js";
import { MODULE_FIND_FUNC_NAMES } from "./constants.js";

const emitHlccAll = (i: number): ExpressionStatement =>
  emitExpressionStatement(
    emitAssignmentExpression(
      emitMemberExpression(
        emitIdentifier("_finds"),
        emitComputedPropName(emitNumericLiteral(i))
      ),
      emitMemberExpression(emitIdentifier("e"), emitIdentifier("c"))
    )
  );

const hlccByDNameTest = (i: number, name: string): [Expression, Statement] => [
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
    emitAssignmentExpression(
      emitMemberExpression(
        emitIdentifier("_finds"),
        emitComputedPropName(emitNumericLiteral(i))
      ),
      emitIdentifier("m")
    )
  ),
];

const hlccByPropsTest = (
  i: number,
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
      emitAssignmentExpression(
        emitMemberExpression(
          emitIdentifier("_finds"),
          emitComputedPropName(emitNumericLiteral(i))
        ),
        emitIdentifier("mDef")
      )
    ),
  ];
};

export default (
  moduleFinds: CallExpression[]
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
          hlccByDNameTest(i, find.arguments[0].expression.value)
        );
        break;
      case "hlccByProps":
        if (find.arguments.some((a) => a.expression.type !== "StringLiteral"))
          throw new Error("all props must be string literals");

        loopedTests.push(
          hlccByPropsTest(
            i,
            // are you serious?????
            // @ts-expect-error (2339)
            find.arguments.map((a) => a.expression.value)
          )
        );
        break;
    }
  }

  statements.push(loopOverModules(loopedTests));

  return [webpackCall(statements), popCall];
};
