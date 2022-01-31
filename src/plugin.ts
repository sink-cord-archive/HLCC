console.log(
  `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~ Hello, World! from HLCC ~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
);

import { CallExpression, Expression, transform } from "@swc/core";
import { Visitor } from "@swc/core/Visitor.js";
import topLevelVisit from "./topLevelVisit";

class HLCC extends Visitor {
  visitCallExpression(n: CallExpression): Expression {
    const expr = topLevelVisit(n);
    return expr ?? n;
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

hlccInject(() => hlccModules())

`,
  {
    plugin: (m) => new HLCC().visitProgram(m),
  }
);
