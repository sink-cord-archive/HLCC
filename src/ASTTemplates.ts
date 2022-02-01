import { ExpressionStatement, Statement } from "@swc/core";

const span = { start: 0, end: 0, ctxt: 0 };

export const popCall: ExpressionStatement = {
  type: "ExpressionStatement",
  expression: {
    type: "CallExpression",
    callee: {
      type: "MemberExpression",
      object: {
        type: "Identifier",
        value: "webpackChunkdiscord_app",
        span,
        optional: false,
      },
      property: {
        type: "Identifier",
        value: "pop",
        span,
        optional: false,
      },
      span,
    },
    arguments: [],
    span,
  },
  span,
};

export const webpackCall = (statements: Statement[]): ExpressionStatement => ({
  span,
  type: "ExpressionStatement",
  expression: {
    span,
    type: "CallExpression",
    callee: {
      type: "MemberExpression",
      object: {
        type: "Identifier",
        value: "webpackChunkdiscord_app",
        span,
        optional: false,
      },
      property: {
        type: "Identifier",
        value: "push",
        span,
        optional: false,
      },
      span,
    },
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
                      callee: {
                        type: "Identifier",
                        value: "Symbol",
                        span,
                        optional: false,
                      },
                      span,
                      arguments: [],
                    },
                  },
                ],
                span,
              },
            },
            {
              expression: {
                type: "ObjectExpression",
                properties: [],
                span,
              },
            },
            {
              expression: {
                type: "ArrowFunctionExpression",
                generator: false,
                async: false,
                params: [
                  {
                    type: "Identifier",
                    value: "e",
                    optional: false,
                    span,
                  },
                ],
                body: {
                  type: "BlockStatement",
                  stmts: statements,
                  span,
                },
                span,
              },
            },
          ],
          span,
        },
      },
    ],
  },
});
