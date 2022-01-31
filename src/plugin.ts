console.log(
  `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~ Hello, World! from HLCC ~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
);

import { CallExpression, Expression, transform } from "@swc/core";
import { Visitor } from "@swc/core/Visitor.js";

class HLCC extends Visitor {
  visitCallExpression(n: CallExpression): Expression {
    if (n.callee.type !== "Identifier" || n.callee.value !== "hlccInject")
      return n;

    if (
      n.arguments.length !== 1 ||
      (n.arguments[0].expression.type !== "ArrowFunctionExpression" &&
        n.arguments[0].expression.type !== "FunctionExpression")
    )
      throw new Error(
        `Error at pos ${n.span.start}: Args to hlccInject were invalid.`
      );

    const func = n.arguments[0].expression;

    console.log(n, func);
    return n;
  }
}

await transform(
  `

console.log((() => "unimportant")())

hlccInject(() => {
  const mods = hlccModules();
  const SettingsView = hlccModByDName("SettingsView");
  const { getChannel } = hlccModByProps("getChannel", "getCategory");
  console.log(SettingsView, getChannel, mods.length);
});

`,
  {
    plugin: (m) => new HLCC().visitProgram(m),
  }
);
