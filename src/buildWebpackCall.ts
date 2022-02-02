import {
  ArrowFunctionExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  ForOfStatement,
  FunctionExpression,
  Statement,
  VariableDeclaration,
} from "@swc/core";

import { webpackCall, popCall, blankSpan } from "./ASTTemplates.js";
import {
  emitAssignmentExpression,
  emitCallExpression,
  emitExpressionStatement,
  emitIdentifier,
  emitMemberExpression,
  emitVariableDeclaration,
} from "./emitters.js";
import { MODULE_FIND_FUNC_NAMES } from "./constants.js";

const emitHlccAll = (i: number): VariableDeclaration =>
  emitVariableDeclaration(
    "const",
    emitIdentifier(`_${i}`),
    emitMemberExpression(emitIdentifier("e"), emitIdentifier("c"))
  );

const emitLoopOverModules = (i: number, test: Expression): ForOfStatement => ({
  span: blankSpan,
  type: "ForOfStatement",
  await: blankSpan,
  left: emitVariableDeclaration("const", emitIdentifier("m")),
  right: emitCallExpression(
    emitMemberExpression(emitIdentifier("Object"), emitIdentifier("values")),
    emitMemberExpression(emitIdentifier("e"), emitIdentifier("c"))
  ),
  body: {
    span: blankSpan,
    type: "IfStatement",
    test,

    consequent: {
      span: blankSpan,
      type: "BlockStatement",
      stmts: [
        emitExpressionStatement(
          emitAssignmentExpression(
            emitIdentifier(`_${i}`),
            emitMemberExpression(
              emitMemberExpression(
                emitIdentifier("m"),
                emitIdentifier("exports")
              ),
              emitIdentifier("default")
            )
          )
        ),
        {
          span: blankSpan,
          type: "BreakStatement",
          label: emitIdentifier(""),
        },
      ],
    },
  },
});

const emitHlccByDName = (
  i: number,
  name: string
): [VariableDeclaration, ForOfStatement] => [
  emitVariableDeclaration("let", emitIdentifier(`_${i}`)),

  emitLoopOverModules(i, {
    span: blankSpan,
    type: "BinaryExpression",
    left: /* {
          span: blankSpan,
          type: "OptionalChainingExpression",
          expr:  */ emitMemberExpression(
      emitMemberExpression(
        emitMemberExpression(emitIdentifier("m"), emitIdentifier("exports")),
        emitIdentifier("default")
      ),
      emitIdentifier("displayName")
    ) /* 
        }, */,
    right: {
      span: blankSpan,
      type: "StringLiteral",
      has_escape: false,
      value: name,
    },
    operator: "===",
  }),
];

const emitHlccByProps = (
  i: number,
  props: string[]
): [VariableDeclaration, ForOfStatement] => {
  throw new Error("TODO: implement");
};

export default (
  moduleFinds: CallExpression[],
  func: ArrowFunctionExpression | FunctionExpression
): [ExpressionStatement, ExpressionStatement] => {
  const statements: Statement[] = [];

  for (let i = 0; i < moduleFinds.length; i++) {
    const find = moduleFinds[i];

    if (
      find.callee.type !== "Identifier" ||
      !MODULE_FIND_FUNC_NAMES.includes(find.callee.value)
    )
      throw new Error("Invalid module find type");

    switch (find.callee.value) {
      case "hlccAll":
        statements.push(emitHlccAll(i));
        break;
      case "hlccByDName":
        if (find.arguments[0].expression.type !== "StringLiteral")
          throw new Error(
            "Invalid display name argument - must be string literal"
          );
        statements.push(
          ...emitHlccByDName(i, find.arguments[0].expression.value)
        );
        break;
      case "hlccByProps":
        if (find.arguments.some((a) => a.expression.type !== "StringLiteral"))
          throw new Error("all props must be string literals");

        statements.push(
          ...emitHlccByProps(
            i,
            // are you serious?????
            // @ts-expect-error (2339)
            find.arguments.map((a) => a.expression.value)
          )
        );
        break;
    }
  }

  return [webpackCall(statements), popCall];
};
