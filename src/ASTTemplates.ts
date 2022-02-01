import { ExpressionStatement, Statement } from "@swc/core";
import { emitIdentifier, emitMemberExpression } from "./emitters.js";

export const blankSpan = { start: 0, end: 0, ctxt: 0 };

export const popCall: ExpressionStatement = {
  type: "ExpressionStatement",
  expression: {
    type: "CallExpression",
    callee: emitMemberExpression(
      emitIdentifier("webpackChunkdiscord_app"),
      emitIdentifier("pop")
    ),
    arguments: [],
    span: blankSpan,
  },
  span: blankSpan,
};

export const webpackCall = (statements: Statement[]): ExpressionStatement => ({
  span: blankSpan,
  type: "ExpressionStatement",
  expression: {
    span: blankSpan,
    type: "CallExpression",
    callee: emitMemberExpression(
      emitIdentifier("webpackChunkdiscord_app"),
      emitIdentifier("push")
    ),
    arguments: [
      {
        expression: {
          type: "ArrayExpression",
          elements: [
            {
              expression: {
                type: "ArrayExpression",
                elements: [
                  {
                    expression: {
                      type: "CallExpression",
                      callee: emitIdentifier("Symbol"),
                      span: blankSpan,
                      arguments: [],
                    },
                  },
                ],
                span: blankSpan,
              },
            },
            {
              expression: {
                type: "ObjectExpression",
                properties: [],
                span: blankSpan,
              },
            },
            {
              expression: {
                type: "ArrowFunctionExpression",
                generator: false,
                async: false,
                params: [emitIdentifier("e")],
                body: {
                  type: "BlockStatement",
                  stmts: statements,
                  span: blankSpan,
                },
                span: blankSpan,
              },
            },
          ],
          span: blankSpan,
        },
      },
    ],
  },
});
