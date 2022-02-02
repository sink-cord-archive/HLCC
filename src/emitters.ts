import {
  ComputedPropName,
  Expression,
  Identifier,
  MemberExpression,
  Pattern,
  PrivateName,
  VariableDeclaration,
} from "@swc/core";
import {
  AssignmentExpression,
  CallExpression,
  ExpressionStatement,
  Import,
  Super,
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
