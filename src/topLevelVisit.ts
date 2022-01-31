import {
  CallExpression,
  Expression,
} from "@swc/core";

export default (n: CallExpression): Expression | undefined => {
  if (n.callee.type !== "Identifier" || n.callee.value !== "hlccInject") return;

  if (
    n.arguments.length !== 1 ||
    (n.arguments[0].expression.type !== "ArrowFunctionExpression" &&
      n.arguments[0].expression.type !== "FunctionExpression")
  )
    throw new Error(
      `Error at pos ${n.span.start}: Args to hlccInject were invalid.`
    );

  const func = n.arguments[0].expression;

  if (func.params.length > 0)
    console.warn(
      "NOTE: hlccInject does not pass any args to the passed function"
    );

  if (func.body.type !== "BlockStatement") {
    console.log(func.body);
  } else {
    console.log(func.body.stmts[0]);
  }

  console.log(func);
  return n;
};
