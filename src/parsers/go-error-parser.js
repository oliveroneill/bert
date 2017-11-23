"use strict";

const VariableNameFilter = require('./variable-name-filter.js');

const GO_ERROR_PREFIX = /[a-zA-Z_\.\/]+\.go:\d+:\d+: /

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
    message = message.replace(new RegExp(GO_ERROR_PREFIX), '');
    return this.filter(message);
  }
}

module.exports = GoErrorParser;
