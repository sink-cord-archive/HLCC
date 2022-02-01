import {
  ArrowFunctionExpression,
  BlockStatement,
  CallExpression,
  Expression,
  ExpressionStatement,
  ExprOrSpread,
  FunctionExpression,
  Statement,
  transform,
} from "@swc/core";
import { Visitor } from "@swc/core/Visitor.js";

const MODULE_FIND_FUNC_NAMES = [
  "hlccAll",
  "hlccByDName",
  "hlccByProps",
  "hlccByPredicate",
];

class HLCC extends Visitor {
  visitCallExpression(n: CallExpression): Expression {
    if (n.callee.type !== "Identifier" || n.callee.value !== "hlccInject")
      return n;

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
  }
}

const transformed = await transform(
  `

console.log((() => "unimportant")())

hlccInject([
    hlccAll(),
    hlccByDName("SettingsView"),
    hlccByProps("getChannel", "getCategory")
  ],
  (mods, SettingsView, { getChannel }) => {
  console.log(SettingsView, getChannel, mods.length);
});

`,
  {
    plugin: (m) => new HLCC().visitProgram(m),
  }
);

console.log(transformed.code)