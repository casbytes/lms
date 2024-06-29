/**
 * Capitalizes the first letter
 * @param sentence - string
 * @returns {String}
 */
export function capitalizeFirstLetter(sentence: string): string {
  return sentence.replace(/^./, (match) => match.toUpperCase());
}
