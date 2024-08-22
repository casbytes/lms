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

/**
 * Return the initials of a user's name
 * @param username - current user's name
 * @returns {String}
 */
export function getInitials(username: string) {
  return username
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export enum ROLE {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum COURSE_STATUS {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum STATUS {
  LOCKED = "LOCKED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum TEST_STATUS {
  LOCKED = "LOCKED",
  AVAILABLE = "AVAILABLE",
  COMPLETED = "COMPLETED",
}

export enum CHECKPOINT_STATUS {
  LOCKED = "LOCKED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum BADGE_LEVEL {
  NOVICE = "NOVICE",
  ADEPT = "ADEPT",
  PROFICIENT = "PROFICIENT",
  VIRTUOSO = "VIRTUOSO",
}

export enum BADGE_STATUS {
  LOCKED = "LOCKED",
  UNLOCKED = "UNLOCKED",
}
