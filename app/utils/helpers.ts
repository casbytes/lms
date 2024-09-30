/**
 * Capitalize the first letter of a sentence
 * @param {string} sentence - The sentence to be capitalized
 * @returns {string} - The sentence with the first letter capitalized
 * 
 * @example
 * const capitalizedSentence = capitalizeFirstLetter("hello world");
 * capitalizedSentence will be "Hello world"
 */
export function capitalizeFirstLetter(sentence: string): string {
  return sentence.replace(/^./, (match) => match.toUpperCase());
}

/**
 * Safely parse a date string or Date object into a Date object
 * @param {Date | string} dateString - The date string or Date object to parse
 * @returns {Date} - A new Date object representing the parsed date
 * 
 * This function ensures that a consistent Date object is returned regardless of whether
 * the input is a string representation of a date or an actual Date object. It's useful
 * for normalizing date inputs in situations where you might receive different date formats.
 * 
 * @example
 * const date1 = safeParseDate("2023-05-15");
 * const date2 = safeParseDate(new Date());
 * 
 * date1 and date2 will be Date objects
 */
export function safeParseDate(dateString: Date | string): Date {
  return new Date(dateString);
}

/**
 * Return the initials of a user's name
 * @param {string} username - The user's full name
 * @returns {string} - The initials of the user's name
 * 
 * This function takes a user's full name and returns their initials.
 * It splits the name into words, takes the first letter of each word,
 * and joins them together.
 * 
 * @example
 * const initials = getInitials("John Doe");
 * initials will be "JD"
 */
export function getInitials(username: string) {
  return username
    .split(" ")
    ?.map((n) => n[0])
    .join("");
}

/**
 * Enum for user roles
 * @enum {string}
 * @property {string} USER - A regular user
 * @property {string} ADMIN - An admin user
 * 
 * This enum is used to represent the different roles that a user can have.
 * 
 * @example
 * const userRole = ROLE.USER;
 * const adminRole = ROLE.ADMIN;
 */
export enum ROLE {
  USER = "USER",
  ADMIN = "ADMIN",
}

/**
 * Enum for user authentication providers
 * @enum {string}
 * @property {string} MagicLink - Magic Link authentication
 * @property {string} Google - Google authentication
 * @property {string} Github - Github authentication
 * 
 * This enum is used to represent the different authentication providers that a user can use.
 * 
 * @example
 * const authProvider = PROVIDER.MagicLink;
 * const googleAuthProvider = PROVIDER.Google;
 * const githubAuthProvider = PROVIDER.Github;
 */
export enum PROVIDER {
  MagicLink = "magic-link",
  Google = "google",
  Github = "github",
}

/**
 * Enum for course status
 * @enum {string}
 * @property {string} IN_PROGRESS - The course is in progress
 * @property {string} COMPLETED - The course is completed
 * 
 * This enum is used to represent the different statuses that a course can have.
 * 
 * @example
 * const courseStatus = COURSE_STATUS.IN_PROGRESS;
 * const completedCourseStatus = COURSE_STATUS.COMPLETED;
 */
export enum COURSE_STATUS {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

/**
 * Enum for checkpoint status
 * @enum {string}
 * @property {string} LOCKED - The checkpoint is locked
 * @property {string} IN_PROGRESS - The checkpoint is in progress
 * @property {string} COMPLETED - The checkpoint is completed
 * 
 * This enum is used to represent the different statuses that a checkpoint can have.
 * 
 * @example
 * const checkpointStatus = CHECKPOINT_STATUS.LOCKED;
 * const inProgressCheckpointStatus = CHECKPOINT_STATUS.IN_PROGRESS;
 * const completedCheckpointStatus = CHECKPOINT_STATUS.COMPLETED;
 */
export enum STATUS {
  LOCKED = "LOCKED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

/**
 * Enum for test status
 * @enum {string}
 * @property {string} LOCKED - The test is locked
 * @property {string} AVAILABLE - The test is available
 * @property {string} COMPLETED - The test is completed
 * 
 * This enum is used to represent the different statuses that a test can have.
 * 
 * @example
 * const testStatus = TEST_STATUS.LOCKED;
 * const availableTestStatus = TEST_STATUS.AVAILABLE;
 * const completedTestStatus = TEST_STATUS.COMPLETED;
 */
export enum TEST_STATUS {
  LOCKED = "LOCKED",
  AVAILABLE = "AVAILABLE",
  COMPLETED = "COMPLETED",
}

/**
 * Enum for badge level
 * @enum {string}
 * @property {string} NOVICE - The badge level is novice
 * @property {string} ADEPT - The badge level is adept
 * @property {string} PROFICIENT - The badge level is proficient
 * @property {string} VIRTUOSO - The badge level is virtuoso
 * 
 * This enum is used to represent the different levels that a badge can have.
 * 
 * @example
 * const badgeLevel = BADGE_LEVEL.NOVICE;
 * const adeptBadgeLevel = BADGE_LEVEL.ADEPT;
 * const proficientBadgeLevel = BADGE_LEVEL.PROFICIENT;
 * const virtuosoBadgeLevel = BADGE_LEVEL.VIRTUOSO;
 */
export enum BADGE_LEVEL {
  NOVICE = "NOVICE",
  ADEPT = "ADEPT",
  PROFICIENT = "PROFICIENT",
  VIRTUOSO = "VIRTUOSO",
}

/**
 * Enum for badge status
 * @enum {string}
 * @property {string} LOCKED - The badge is locked
 * @property {string} UNLOCKED - The badge is unlocked
 * 
 * This enum is used to represent the different statuses that a badge can have.
 * 
 * @example
 * const badgeStatus = BADGE_STATUS.LOCKED;
 * const unlockedBadgeStatus = BADGE_STATUS.UNLOCKED;
 */
export enum BADGE_STATUS {
  LOCKED = "LOCKED",
  UNLOCKED = "UNLOCKED",
}

/**
 * Enum for test environment
 * @enum {string}
 * @property {string} PYTHON - The test environment is python
 * @property {string} NODE - The test environment is node
 * @property {string} BROWSER - The test environment is browser
 * 
 * This enum is used to represent the different environments that a test can be run in.
 * 
 * @example
 * const testEnvironment = TEST_ENV.PYTHON;
 * const nodeTestEnvironment = TEST_ENV.NODE;
 * const browserTestEnvironment = TEST_ENV.BROWSER;
 */
export enum TEST_ENV {
  PYTHON = "python",
  NODE = "node",
  BROWSER = "browser",
}
