import {
  ArrowFunctionExpression,
  CallExpression,
  ExpressionStatement,
  ForOfStatement,
  FunctionExpression,
  Statement,
  VariableDeclaration,
} from "@swc/core";

import { webpackCall, popCall, blankSpan } from "./ASTTemplates.js";
import {
  emitIdentifier,
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

const emitHlccByDName = (
  i: number,
  name: string
): [VariableDeclaration, ForOfStatement] => [
  emitVariableDeclaration("let", emitIdentifier(`_${i}`)),

  {
    span: blankSpan,
    type: "ForOfStatement",
    await: blankSpan,
    left: emitVariableDeclaration("const", emitIdentifier("m")),
    right: {
      span: blankSpan,
      type: "CallExpression",
      callee: emitMemberExpression(
        emitIdentifier("Object"),
        emitIdentifier("values")
      ),
      arguments: [
        {
          expression: emitMemberExpression(
            emitIdentifier("e"),
            emitIdentifier("c")
          ),
        },
      ],
    },
    body: {
      span: blankSpan,
      type: "IfStatement",
      test: {
        span: blankSpan,
        type: "BinaryExpression",
        left: /* emitIdentifier("m"), */ {
          span: blankSpan,
          type: "OptionalChainingExpression",
          expr: emitMemberExpression(
            emitMemberExpression(
              emitMemberExpression(
                emitIdentifier("m"),
                emitIdentifier("exports")
              ),
              emitIdentifier("default")
            ),
            emitIdentifier("displayName")
          ),
        },
        right: {
          span: blankSpan,
          type: "StringLiteral",
          has_escape: false,
          value: name,
        },
        operator: "===",
      },

      consequent: {
        span: blankSpan,
        type: "BlockStatement",
        stmts: [
          {
            span: blankSpan,
            type: "ExpressionStatement",
            expression: {
              span: blankSpan,
              type: "AssignmentExpression",
              left: emitIdentifier(`_${i}`),
              right: emitMemberExpression(
                emitMemberExpression(
                  emitIdentifier("m"),
                  emitIdentifier("exports")
                ),
                emitIdentifier("default")
              ),
              operator: "=",
            },
          },
          {
            span: blankSpan,
            type: "BreakStatement",
            label: emitIdentifier(""),
          },
        ],
      },
    },
  },
];

export default (
  moduleFinds: CallExpression[],
  func: ArrowFunctionExpression | FunctionExpression
): [ExpressionStatement, ExpressionStatement] => {
  const statements: Statement[] = [];

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
        statements.push(
          ...emitHlccByDName(i, find.arguments[0].expression.value)
        );
        break;
    }
  }

  return [webpackCall(statements), popCall];
};
