import {
  ComputedPropName,
  Expression,
  Identifier,
  MemberExpression,
  Pattern,
  PrivateName,
  VariableDeclaration,
} from "@swc/core";
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
