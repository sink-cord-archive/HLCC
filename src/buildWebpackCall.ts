import {
  ArrowFunctionExpression,
  AssignmentExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionExpression,
  Statement,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarator,
} from "@swc/core";

import { webpackCall, loopOverModules, blankSpan } from "./ASTTemplates.js";
import {
  emitAssignmentExpression,
  emitBinaryExpression,
  emitCallExpression,
  emitComputedPropName,
  emitExpressionStatement,
  emitIdentifier,
  emitMemberExpression,
  emitNumericLiteral,
  emitOptionalChain,
  emitStringLiteral,
  emitUpdateExpression,
  emitVariableDeclaration,
  emitVariableDeclarator,
} from "./emitters.js";
import { MODULE_FIND_FUNC_NAMES } from "./constants.js";

const addIndexCheck = (
  varN: string,
  test: Expression | undefined,
  indexed?: [string, number]
): Expression => {
  const indexCheck = (i: [string, number]) =>
    emitBinaryExpression(
      emitUpdateExpression(emitIdentifier(i[0]), "++"),
      emitNumericLiteral(i[1]),
      "==="
    );

  const undefinedCheck: UnaryExpression = {
    span: blankSpan,
    type: "UnaryExpression",
    operator: "!",
    argument: emitIdentifier(varN),
  };

  const check = indexed ? indexCheck(indexed) : undefinedCheck;

  return test ? emitBinaryExpression(test, check, "&&") : check;
};

const hlccByDNameTest = (
  varN: string,
  name: string,
  indexed?: [string, number]
): [Expression, Statement] => [
  addIndexCheck(
    varN,
    emitBinaryExpression(
      emitOptionalChain(emitIdentifier("mDef"), emitIdentifier("displayName")),
      emitStringLiteral(name),
      "==="
    ),
    indexed
  ),
  emitExpressionStatement(
    emitAssignmentExpression(emitIdentifier(varN), emitIdentifier("m"))
  ),
];

const hlccByPropsTest = (
  varN: string,
  props: string[],
  indexed?: [string, number]
): [Expression, Statement] => {
  const mProp = (prop: string) =>
    emitMemberExpression(emitIdentifier("mDef"), emitIdentifier(prop));

  let expr: Expression = emitOptionalChain(
    emitIdentifier("mDef"),
    emitIdentifier(props[0])
  );

  for (const prop of props.slice(1))
    expr = emitBinaryExpression(expr, mProp(prop), "&&");

  expr = addIndexCheck(varN, expr, indexed);

  return [
    expr,
    emitExpressionStatement(
      emitAssignmentExpression(emitIdentifier(varN), emitIdentifier("mDef"))
    ),
  ];
};

const hlccByPredicateTest = (
  varN: string,
  pred: Expression,
  indexed?: [string, number]
): [Expression, Statement] => [
  addIndexCheck(
    varN,
    emitCallExpression(pred, emitIdentifier("mRes")),
    indexed
  ),
  emitExpressionStatement(
    emitAssignmentExpression(emitIdentifier(varN), emitIdentifier("mRes"))
  ),
];

export default (
  moduleFinds: CallExpression[],
  func: ArrowFunctionExpression | FunctionExpression
): [VariableDeclaration, ExpressionStatement, ExpressionStatement] => {
  const params = func.params.map((p) => {
    if (p.type === "Identifier") return p.value;
    throw new Error(
      "Params to your function must be identifiers, not " + p.type
    );
  });

  // variables to declare before the call
  const variableDeclarations: VariableDeclarator[] = [];
  // list of var names for indexed finds
  const indexDeclarations: string[] = [];
  // contents of loop over modules
  const loopedTests: [Expression, Statement][] = [];
  // list of variables to assign modules to
  const moduleAssignments: string[] = [];

  for (let i = 0; i < moduleFinds.length; i++) {
    const find = moduleFinds[i];

    if (
      find.callee.type !== "Identifier" ||
      !MODULE_FIND_FUNC_NAMES.includes(find.callee.value)
    )
      throw new Error("Invalid module find type");

    const lastArg = find.arguments[find.arguments.length - 1];
    const indexed =
      lastArg?.expression.type === "NumericLiteral"
        ? lastArg.expression.value
        : undefined;

    if (indexed) indexDeclarations.push(`_i${i}`);
    const args = indexed ? find.arguments.slice(0, -1) : find.arguments;

    switch (find.callee.value) {
      case "hlccAll":
        variableDeclarations.push(
          emitVariableDeclarator(emitIdentifier(params[i]))
        );
        moduleAssignments.push(params[i]);
        break;
      case "hlccByDName":
        if (args[0].expression.type !== "StringLiteral")
          throw new Error(
            "Invalid display name argument - must be string literal"
          );
        variableDeclarations.push({
          span: blankSpan,
          type: "VariableDeclarator",
          definite: false,
          id: emitIdentifier(params[i]),
        });
        loopedTests.push(
          hlccByDNameTest(
            params[i],
            args[0].expression.value,
            indexed ? [`_i${i}`, indexed] : undefined
          )
        );
        break;
      case "hlccByProps":
        if (args.some((a) => a.expression.type !== "StringLiteral"))
          throw new Error("all props must be string literals");

        variableDeclarations.push({
          span: blankSpan,
          type: "VariableDeclarator",
          definite: false,
          id: emitIdentifier(params[i]),
        });
        loopedTests.push(
          hlccByPropsTest(
            params[i],
            // are you serious?????
            // @ts-expect-error (2339)
            args.map((a) => a.expression.value),
            indexed ? [`_i${i}`, indexed] : undefined
          )
        );
        break;
      
      case "hlccByPredicate":
        variableDeclarations.push({
          span: blankSpan,
          type: "VariableDeclarator",
          definite: false,
          id: emitIdentifier(params[i]),
        });
        loopedTests.push(
          hlccByPredicateTest(
            params[i],
            args[0].expression,
            indexed ? [`_i${i}`, indexed] : undefined
          )
        );
        break;

      default:
        throw new Error("Invalid module find " + find.callee.value)
    }
  }

  let moduleAssignmentExpr: AssignmentExpression | undefined;
  for (const modAssign of moduleAssignments)
    moduleAssignmentExpr = emitAssignmentExpression(
      emitIdentifier(modAssign),
      moduleAssignmentExpr ??
        emitMemberExpression(emitIdentifier("e"), emitIdentifier("c"))
    );

  let statements: Statement[] = [
    ...(moduleAssignmentExpr
      ? [emitExpressionStatement(moduleAssignmentExpr)]
      : []),
    ...loopOverModules(indexDeclarations, loopedTests),
  ];

  return [
    emitVariableDeclaration("let", ...variableDeclarations),
    webpackCall(statements),
    emitExpressionStatement(
      emitCallExpression(
        emitMemberExpression(emitIdentifier("_w"), emitIdentifier("pop"))
      )
    ),
  ];
};
