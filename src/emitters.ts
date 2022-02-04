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
} from "@swc/core/types";
import { blankSpan } from "./ASTTemplates.js";

export const emitIdentifier = (name: string): Identifier => ({
  span: blankSpan,
  type: "Identifier",
  value: name,
  optional: false,
});

export const emitMemberExpression = (
  object: Expression,
  property: Identifier | PrivateName | ComputedPropName
): MemberExpression => ({
  span: blankSpan,
  type: "MemberExpression",
  object,
  property,
});

export const emitVariableDeclaration = (
  kind: "const" | "let" | "var",
  id: Pattern,
  init?: Expression
): VariableDeclaration => ({
  span: blankSpan,
  type: "VariableDeclaration",
  kind,
  declare: false,
  declarations: [
    {
      span: blankSpan,
      type: "VariableDeclarator",
      definite: true,
      id,
      init,
    },
  ],
});

export const emitCallExpression = (
  callee: Expression | Super | Import,
  ...args: Expression[]
): CallExpression => ({
  span: blankSpan,
  type: "CallExpression",
  callee,
  arguments: args.map((a) => ({
    expression: a,
  })),
});

export const emitAssignmentExpression = (
  left: Expression,
  right: Expression
): AssignmentExpression => ({
  span: blankSpan,
  type: "AssignmentExpression",
  left,
  right,
  operator: "=",
});

export const emitExpressionStatement = (
  expression: Expression
): ExpressionStatement => ({
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

export const emitBlockStatement = (...stmts: Statement[]): BlockStatement => ({
  span: blankSpan,
  type: "BlockStatement",
  stmts,
});

export const emitIfStatement = (
  test: Expression,
  statements: Statement | Statement[]
): IfStatement => ({
  span: blankSpan,
  type: "IfStatement",
  test,

  consequent: Array.isArray(statements)
    ? emitBlockStatement(...statements)
    : statements,
});

export const emitStringLiteral = (str: string): StringLiteral => ({
  span: blankSpan,
  type: "StringLiteral",
  has_escape: false,
  value: str,
});

export const emitBinaryExpression = (
  left: Expression,
  right: Expression,
  op: BinaryOperator
): BinaryExpression => ({
  span: blankSpan,
  type: "BinaryExpression",
  left,
  right,
  operator: op,
});
