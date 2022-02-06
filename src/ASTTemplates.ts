import {
  ArrowFunctionExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  ForInStatement,
  FunctionExpression,
  Span,
  Statement,
  VariableDeclaration,
} from "@swc/core";
import buildWebpackCall from "./buildWebpackCall.js";
import {
  emitArrayExpression,
  emitArrowFunctionExpression,
  emitBinaryExpression,
  emitBlockStatement,
  emitCallExpression,
  emitComputedPropName,
  emitConditionalExpression,
  emitExpressionStatement,
  emitIdentifier,
  emitIfStatement,
  emitMemberExpression,
  emitVariableDeclaration,
} from "./emitters.js";

export const blankSpan: Span = { start: 0, end: 0, ctxt: 0 };

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
    emitCallExpression(emitArrowFunctionExpression([], statements))
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

export const loopOverModules = (
  tests: [Expression, Statement][]
): ForInStatement => ({
  span: blankSpan,
  type: "ForInStatement",
  left: emitVariableDeclaration("const", emitIdentifier("k")),
  right: emitMemberExpression(emitIdentifier("e"), emitIdentifier("c")),
  body: emitBlockStatement(
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
    emitVariableDeclaration(
      "const",
      emitIdentifier("mDef"),
      emitConditionalExpression(
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
        emitMemberExpression(emitIdentifier("m"), emitIdentifier("default")),
        emitIdentifier("m")
      )
    ),
    ...tests.map(([t, s]): Statement => emitIfStatement(t, s))
  ),
});

export const webpackAndRun = (
  moduleFinds: CallExpression[],
  func: ArrowFunctionExpression | FunctionExpression
): [
  VariableDeclaration,
  ExpressionStatement,
  ExpressionStatement,
  ExpressionStatement
] => [
  emitVariableDeclaration(
    "const",
    emitIdentifier("_finds"),
    emitArrayExpression()
  ),
  ...buildWebpackCall(moduleFinds),
  emitExpressionStatement(
    emitCallExpression(func, {
      expression: emitIdentifier("_finds"),
      spread: blankSpan,
    })
  ),
];
