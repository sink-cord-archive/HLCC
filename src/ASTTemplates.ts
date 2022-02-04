import { ExpressionStatement, Statement } from "@swc/core";
import {
  emitArrayExpression,
  emitCallExpression,
  emitIdentifier,
  emitMemberExpression,
} from "./emitters.js";

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
        expression: emitArrayExpression(
          emitArrayExpression(emitCallExpression(emitIdentifier("Symbol"))),
          {
            type: "ObjectExpression",
            properties: [],
            span: blankSpan,
          },
          {
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
          }
        ),
      },
    ],
  },
});
