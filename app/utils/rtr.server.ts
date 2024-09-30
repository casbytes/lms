import { computeScore } from "./helpers.server";
import { Cache as Redis } from "./cache.server";

/**
 * Format the checker response
 * @param {Object} props - Properties
 * @param {string | null} props.error - Error
 * @param {LintResult[] | null} props.lintResults - Lint results
 * @param {TestResults | null} props.testResults - Test results
 * @returns {ApiResponse} - API response
 * 
 * @example
 * const response = formatCheckerResponse({
 *   error: null,
 *   lintResults: null,
 *   testResults: null,
 * });
 * response will be an object containing the error, lintResults, and testResults
 */
export function formatCheckerResponse({
  error = null,
  lintResults = null,
  testResults = null,
}: {
  error?: string | null;
  lintResults?: LintResult[] | null;
  testResults?: TestResults | null;
}) {
  return { error, lintResults, testResults };
}

/**
 * Subscribe to the queue
 * @param {string} messageId - Message ID
 * @returns {Promise<CombinedResponse>} - Combined response
 * 
 * @example
 * const { computedScores, response } = await subscribeToQueue("message_123");
 * computedScores will be an object containing the totalScore, totalLintsScore, and totalTestsScore
 * response will be an object containing the error, lintResults, and testResults
 */
export async function subscribeToQueue(
  messageId: string
): Promise<CombinedResponse> {
  let computedScores: ComputeScores | null = null;
  return new Promise((resolve, reject) => {
    try {
      Redis.subscribe(messageId, async (message) => {
        try {
          const response = formatCheckerResponse(JSON.parse(atob(message)));
          computedScores = await computeScore(response);
          resolve({
            computedScores,
            response,
          });
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

interface Message {
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType: string;
  messageId: string;
  endLine: number;
  endColumn: number;
}

export interface LintResult {
  filePath: string;
  messages: Message[] | [];
  suppressedMessages: unknown[];
  errorCount: number;
  fatalErrorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source: string;
  usedDeprecatedRules: unknown[];
}

interface AssertionResult {
  ancestorTitles: string[];
  fullName: string;
  status: string;
  title: string;
  duration: number;
  failureMessages: string[];
  meta: Record<string, unknown>;
}

interface TestResultDetail {
  assertionResults: AssertionResult[];
  startTime: number;
  endTime: number;
  status: string;
  message: string;
  name: string;
}

interface Snapshot {
  added: number;
  failure: boolean;
  filesAdded: number;
  filesRemoved: number;
  filesRemovedList: unknown[];
  filesUnmatched: number;
  filesUpdated: number;
  matched: number;
  total: number;
  unchecked: number;
  uncheckedKeysByFile: unknown[];
  unmatched: number;
  updated: number;
  didUpdate: boolean;
}

export interface TestResults {
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numPendingTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  numTodoTests: number;
  snapshot: Snapshot;
  startTime: number;
  success: boolean;
  testResults: TestResultDetail[];
}

export interface ApiResponse {
  lintResults: LintResult[] | null;
  testResults: TestResults | null;
  error: string | null;
}

interface ComputeScores {
  totalScore: number;
  totalLintsScore: number;
  totalTestsScore: number;
}

export interface CombinedResponse {
  computedScores: ComputeScores | null;
  response: ApiResponse;
}
