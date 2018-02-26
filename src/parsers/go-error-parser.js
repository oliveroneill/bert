"use strict";

const VariableNameFilter = require('./variable-name-filter.js');

// Taken from: https://github.com/Microsoft/vscode/blob/master/src/vs/workbench/parts/tasks/common/problemMatcher.ts
const GO_ERROR_PREFIX = /^([^:]*: )?((.:)?[^:]*):(\d+)(:(\d+))?: (.*)$/

/**
 * Used to read Go errors
 */
class GoErrorParser extends VariableNameFilter {
  /*
   * Used to determine whether this parser should be used to evaluate
   * the line.
   *
   * @param message the line to check
   * @return true when it identifies an Go error
   */
  evaluate(message: string): bool {
    return new RegExp(GO_ERROR_PREFIX).test(message);
  }

  /**
   * Use this function to pass each line of an error to the parser
   * and eventually receive an output. It will return null until it
   * has enough information to pass a useful error message
   *
   * @param message the line to parse
   * @return cleaned output
   */
  parse(message: string): ?string {
    message = GO_ERROR_PREFIX.exec(message)[7];
    return this.filter(message);
  }
}

module.exports = GoErrorParser;
