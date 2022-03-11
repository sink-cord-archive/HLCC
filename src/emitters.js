import type {
  AssignmentExpression,
  CallExpression,
  ExpressionStatement,
  Import,
  Super,
  ComputedPropName,
  Expression,
  Identifier,
  MemberExpression,
  Pattern,
  PrivateName,
  VariableDeclaration,
  ArrayExpression,
  ExprOrSpread,
  Statement,
  IfStatement,
  BlockStatement,
  StringLiteral,
  BinaryOperator,
  BinaryExpression,
  ArrowFunctionExpression,
  ConditionalExpression,
  NumericLiteral,
  OptionalChainingExpression,
  VariableDeclarator,
  UpdateOperator,
  UpdateExpression,
} from "@swc/core";
import { blankSpan } from "./ASTTemplates.js";

export const emitIdentifier = (name): Identifier => ({
  span: blankSpan,
  type: "Identifier",
  value: name,
  optional: false,
});

export const emitMemberExpression = (object, property): MemberExpression => ({
  span: blankSpan,
  type: "MemberExpression",
  object,
  property,
});

export const emitVariableDeclaration = (
  kind: "const" | "let" | "var",
  ...declarations
): VariableDeclaration => ({
  span: blankSpan,
  type: "VariableDeclaration",
  kind,
  declare: false,
  declarations,
});

export const emitVariableDeclarator = (id, init?): VariableDeclarator => ({
  span: blankSpan,
  type: "VariableDeclarator",
  definite: true,
  id,
  init,
});

export const emitCallExpression = (
  callee,
  ...args: (Expression | ExprOrSpread)[]
): CallExpression => ({
  span: blankSpan,
  type: "CallExpression",
  callee,
  arguments: args.map((a): ExprOrSpread =>
    // @ts-expect-error
    a.type ? { expression: a } : a
  ),
});

export const emitAssignmentExpression = (
  left: Expression,
  right
): AssignmentExpression => ({
  span: blankSpan,
  type: "AssignmentExpression",
  left,
  right,
  operator: "=",
});

export const emitExpressionStatement = (expression): ExpressionStatement => ({
  span: blankSpan,
  type: "ExpressionStatement",
  expression,
});

export const emitArrayExpression = (
  ...elements: Expression[]
): ArrayExpression => ({
  type: "ArrayExpression",
  elements: elements.map((e): ExprOrSpread => ({ expression: e })),
  span: blankSpan,
});

export const emitBlockStatement = (...stmts): BlockStatement => ({
  span: blankSpan,
  type: "BlockStatement",
  stmts,
});

export const emitIfStatement = (
  test,
  statements: Statement | Statement[],
  alternate?: Statement | Statement[]
): IfStatement => ({
  span: blankSpan,
  type: "IfStatement",
  test,

  consequent: Array.isArray(statements)
    ? emitBlockStatement(...statements)
    : statements,

  alternate:
    alternate === undefined
      ? undefined
      : Array.isArray(alternate)
      ? emitBlockStatement(...alternate)
      : alternate,
});

export const emitStringLiteral = (str): StringLiteral => ({
  span: blankSpan,
  type: "StringLiteral",
  hasEscape: false,
  value: str,
});

export const emitBinaryExpression = (left, right, op): BinaryExpression => ({
  span: blankSpan,
  type: "BinaryExpression",
  left,
  right,
  operator: op,
});

export const emitArrowFunctionExpression = (
  params,
  stmts,
  async = false
): ArrowFunctionExpression => ({
  type: "ArrowFunctionExpression",
  generator: false,
  async,
  params,
  body: emitBlockStatement(...stmts),
  span: blankSpan,
});

export const emitComputedPropName = (expression): ComputedPropName => ({
  span: blankSpan,
  type: "Computed",
  expression,
});

export const emitConditionalExpression = (
  test,
  consequent,
  alternate
): ConditionalExpression => ({
  span: blankSpan,
  type: "ConditionalExpression",
  test,
  consequent,
  alternate,
});

export const emitNumericLiteral = (value): NumericLiteral => ({
  span: blankSpan,
  type: "NumericLiteral",
  value,
});

export const emitOptionalChain = (
  object,
  property
): OptionalChainingExpression => ({
  span: blankSpan,
  type: "OptionalChainingExpression",
  // @ts-expect-error - why isnt this in the type defs?
  questionDotToken: blankSpan,
  expr: emitMemberExpression(object, property),
});

export const emitUpdateExpression = (
  argument,
  operator,
  prefix: boolean = false
): UpdateExpression => ({
  span: blankSpan,
  type: "UpdateExpression",
  operator,
  prefix,
  argument,
});
