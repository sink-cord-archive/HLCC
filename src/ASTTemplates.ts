import { ExpressionStatement, Statement } from "@swc/core";
import {
  emitArrayExpression,
  emitArrowFunctionExpression,
  emitAssignmentExpression,
  emitBinaryExpression,
  emitBlockStatement,
  emitCallExpression,
  emitComputedPropName,
  emitExpressionStatement,
  emitIdentifier,
  emitIfStatement,
  emitMemberExpression,
  emitVariableDeclaration,
} from "./emitters.js";

export const blankSpan = { start: 0, end: 0, ctxt: 0 };

export const popCall: ExpressionStatement = emitExpressionStatement(
  emitCallExpression(
    emitMemberExpression(
      emitIdentifier("webpackChunkdiscord_app"),
      emitIdentifier("pop")
    )
  )
);

export const iife = (statements: Statement[]): ExpressionStatement =>
  emitExpressionStatement(
    emitCallExpression(
      emitArrowFunctionExpression(
        [],
        [
          ...statements,
          emitExpressionStatement({
            span: blankSpan,
            type: "UnaryExpression",
            operator: "void",
            argument: {
              span: blankSpan,
              type: "NumericLiteral",
              value: 0,
            },
          }),
        ]
      )
    )
  );

export const webpackCall = (statements: Statement[]): ExpressionStatement =>
  emitExpressionStatement(
    emitCallExpression(
      emitMemberExpression(
        emitIdentifier("webpackChunkdiscord_app"),
        emitIdentifier("push")
      ),
      emitArrayExpression(
        emitArrayExpression(emitCallExpression(emitIdentifier("Symbol"))),
        {
          type: "ObjectExpression",
          properties: [],
          span: blankSpan,
        },
        emitArrowFunctionExpression([emitIdentifier("e")], statements)
      )
    )
  );

export const generateModuleList: Statement[] = [
  emitVariableDeclaration("const", emitIdentifier("_mod"), {
    span: blankSpan,
    type: "ObjectExpression",
    properties: [],
  }),
  {
    span: blankSpan,
    type: "ForInStatement",
    left: emitVariableDeclaration("const", emitIdentifier("k")),
    right: emitMemberExpression(emitIdentifier("e"), emitIdentifier("c")),
    body: emitBlockStatement(
      emitIfStatement(
        emitCallExpression(
          emitMemberExpression(
            emitMemberExpression(emitIdentifier("e"), emitIdentifier("c")),
            emitIdentifier("hasOwnProperty")
          ),
          emitIdentifier("k")
        ),
        [
          emitVariableDeclaration(
            "const",
            emitIdentifier("m"),
            emitMemberExpression(
              emitMemberExpression(
                emitMemberExpression(emitIdentifier("e"), emitIdentifier("c")),
                emitComputedPropName(emitIdentifier("k"))
              ),
              emitIdentifier("exports")
            )
          ),
          emitIfStatement(
            emitBinaryExpression(
              emitIdentifier("m"),
              emitBinaryExpression(
                emitMemberExpression(
                  emitIdentifier("m"),
                  emitIdentifier("default")
                ),
                emitMemberExpression(
                  emitIdentifier("m"),
                  emitIdentifier("__esModule")
                ),
                "&&"
              ),
              "&&"
            ),
            emitExpressionStatement(
              emitAssignmentExpression(
                emitMemberExpression(
                  emitIdentifier("_mod"),
                  emitComputedPropName(emitIdentifier("k"))
                ),
                emitMemberExpression(
                  emitIdentifier("m"),
                  emitIdentifier("default")
                )
              )
            ),
            emitExpressionStatement(
              emitAssignmentExpression(
                emitMemberExpression(
                  emitIdentifier("_mod"),
                  emitComputedPropName(emitIdentifier("k"))
                ),
                emitIdentifier("m")
              )
            )
          ),
        ]
      )
    ),
  },
];
