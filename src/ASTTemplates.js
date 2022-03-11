import {
  ArrowFunctionExpression,
  BlockStatement,
  CallExpression,
  Expression,
  ExpressionStatement,
  ForInStatement,
  FunctionExpression,
  IfStatement,
  Span,
  Statement,
  UnaryExpression,
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
  emitNumericLiteral,
  emitOptionalChain,
  emitStringLiteral,
  emitVariableDeclaration,
  emitVariableDeclarator,
} from "./emitters.js";

export const blankSpan: Span = { start: 0, end: 0, ctxt: 0 };

export const void0: UnaryExpression = {
  span: blankSpan,
  type: "UnaryExpression",
  argument: emitNumericLiteral(0),
  operator: "void",
};

export const webpackCall = (statements: Statement[]): ExpressionStatement =>
  emitExpressionStatement(
    emitCallExpression(
      emitMemberExpression(emitIdentifier("_w"), emitIdentifier("push")),
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
  decls: string[],
  tests: [Expression, Statement][]
): Statement[] => [
  ...(decls.length === 0
    ? []
    : [
        emitVariableDeclaration(
          "let",
          ...decls.map((d) =>
            emitVariableDeclarator(emitIdentifier(d), emitNumericLiteral(0))
          )
        ),
      ]),
  {
    span: blankSpan,
    type: "ForInStatement",
    left: emitVariableDeclaration(
      "const",
      emitVariableDeclarator(emitIdentifier("k"))
    ),
    right: emitMemberExpression(emitIdentifier("e"), emitIdentifier("c")),
    body: emitBlockStatement(
      emitVariableDeclaration(
        "const",
        emitVariableDeclarator(
          emitIdentifier("m"),
          emitMemberExpression(
            emitMemberExpression(
              emitMemberExpression(emitIdentifier("e"), emitIdentifier("c")),
              emitComputedPropName(emitIdentifier("k"))
            ),
            emitIdentifier("exports")
          )
        )
      ),
      emitVariableDeclaration(
        "const",
        emitVariableDeclarator(
          emitIdentifier("mDef"),
          emitConditionalExpression(
            emitBinaryExpression(
              emitOptionalChain(emitIdentifier("m"), emitIdentifier("default")),
              emitMemberExpression(
                emitIdentifier("m"),
                emitIdentifier("__esModule")
              ),
              "&&"
            ),
            emitMemberExpression(
              emitIdentifier("m"),
              emitIdentifier("default")
            ),
            emitIdentifier("m")
          )
        )
      ),
      ...tests.map(([t, s]): Statement => emitIfStatement(t, s))
    ),
  },
];

export const webpackAndRun = (
  moduleFinds: CallExpression[],
  func: ArrowFunctionExpression | FunctionExpression
): Statement[] => [
  emitVariableDeclaration(
    "const",
    emitVariableDeclarator(
      emitIdentifier("_w"),
      emitIdentifier("webpackChunkdiscord_app")
    )
  ),
  ...buildWebpackCall(moduleFinds, func),
  ...(func.body.type === "BlockStatement"
    ? func.body.stmts
    : [emitExpressionStatement(func.body)]),
  emitExpressionStatement(void0),
];
