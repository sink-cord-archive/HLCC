import {
  CallExpression,
  ExpressionStatement,
  Program,
  Statement,
  transform,
} from "@swc/core";

import { Visitor } from "@swc/core/Visitor.js";
import { webpackAndRun } from "./ASTTemplates.js";
import { emitBlockStatement } from "./emitters.js";

class HLCC extends Visitor {
  visitExpressionStatement(stmt: ExpressionStatement): Statement {
    const n = stmt.expression;
    if (
      n.type !== "CallExpression" ||
      n.callee.type !== "Identifier" ||
      n.callee.value !== "hlccInject"
    )
      return stmt;

    if (
      n.arguments.length !== 2 ||
      n.arguments[0].expression.type !== "ArrayExpression" ||
      (n.arguments[1].expression.type !== "ArrowFunctionExpression" &&
        n.arguments[1].expression.type !== "FunctionExpression")
    )
      throw new Error(
        `Error at pos ${n.span.start}: Args to hlccInject were invalid.`
      );

    const moduleFinds = n.arguments[0].expression.elements.map(
      (m) => m?.expression
    );

    if (
      !moduleFinds.every(
        // ts moment bruh
        (m): m is CallExpression => m?.type === "CallExpression" /*  &&
          m.callee.type === "Identifier" &&
          MODULE_FIND_FUNC_NAMES.includes(m.callee.value) */
      )
    )
      throw new Error("Module find was not a call");

    const func = n.arguments[1].expression;

    if (func.params.length !== moduleFinds.length)
      console.warn(
        "NOTE: the amount of args taken by your function does not match the amount of module finds you ask for"
      );

    return emitBlockStatement(...webpackAndRun(moduleFinds, func));
  }
}

export default async (input: string, shouldMinify: boolean = true) =>
  (
    await transform(input, {
      plugin: (m) => new HLCC().visitProgram(m),
      minify: shouldMinify,
      jsc: {
        target: "es2022",
        minify: {
          /* compress: {
          inline: 0,
        },*/
          mangle: shouldMinify,
        },
      },
    })
  ).code;
