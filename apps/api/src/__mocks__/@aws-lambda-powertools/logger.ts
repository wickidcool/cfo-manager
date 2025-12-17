/**
 * Manual mock for @aws-lambda-powertools/logger
 */

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => { };

export class Logger {
  info = noOp;
  error = noOp;
  warn = noOp;
  debug = noOp;
  addContext = noOp;
}
