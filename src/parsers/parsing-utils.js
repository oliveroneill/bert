/**
 * Stores useful functions for filtering and parsing
 * output.
 */
class ParsingUtils {
  static removeFilePaths(message: string) : string {
    let regex = new RegExp(/(\/*[a-zA-Z0-9_.-]+\/)+[a-zA-Z0-9_.-]+\.[a-zA-Z0-9_.-]+/g);
    message = message.replace(regex, '');
    return message;
  }
}

module.exports = ParsingUtils;