import { Options, Output } from "@swc/core";
import { printSync, parseSync } from "@swc/wasm";

// god knows why this is needed
export default (code: string, opts: Options): Output => {
  const tree = parseSync(code, opts.jsc?.parser ?? {syntax: "ecmascript"});
  const transformed = opts.plugin?.(tree) ?? tree;
  return printSync(transformed, opts);
}