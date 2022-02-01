import {
  ArrowFunctionExpression,
  CallExpression,
  ExpressionStatement,
  FunctionExpression,
  Statement,
} from "@swc/core";

import { webpackCall, popCall } from "./ASTTemplates";

export default (
  moduleFinds: CallExpression[],
  func: ArrowFunctionExpression | FunctionExpression
): [ExpressionStatement, ExpressionStatement] => {
  const statements: Statement[] = [];

  return [webpackCall(statements), popCall];
};
