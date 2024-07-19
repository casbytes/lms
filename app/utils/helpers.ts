/**
 * Capitalizes the first letter
 * @param sentence - string
 * @returns {String}
 */
export function capitalizeFirstLetter(sentence: string): string {
  return sentence.replace(/^./, (match) => match.toUpperCase());
}

/**
 *  Convert date string to date
 * @param {Date} dateString - Date string
 * @returns {Date | null}
 */
export function safeParseDate(dateString: Date | string): Date {
  return new Date(dateString);
}
