import {
  CallExpression,
  ExpressionStatement,
  Program,
  Statement,
} from "@swc/core";
import { transformSync } from "@swc/wasm";

import { Visitor } from "@swc/core/Visitor.js";
import { webpackAndRun } from "./ASTTemplates.js";
import { emitBlockStatement } from "emitkit";

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

export const plugin = (m: Program) => new HLCC().visitProgram(m);

export default (input: string, shouldMinify: boolean = true) =>
  transformSync(input, {
    plugin,
    minify: shouldMinify,
    jsc: {
      target: "es2022",
      minify: {
        mangle: shouldMinify,
      },
    },
  }).code;
