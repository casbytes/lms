import { computeScore } from "./helpers.server";
import { Cache as Redis } from "./cache.server";

/**
 * Format the response
 * @param error - error message
 * @param message - message
 * @param lintReulsts - lint results
 * @param testResults - test results
 * @returns {ApiResponse}
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
 * Waits for a message from Redis with a timeout and computes the score.
 * @param messageId - The message ID to subscribe to.
 * @param timeoutDuration - Duration in milliseconds to wait before timing out.
 * @returns {Promise<ComputeScores| ApiResponse>}
 */
export async function waitForMessageAndComputeScore(
  messageId: string,
  timeoutDuration: number = 30000
): Promise<CombinedResponse | null> {
  return new Promise((resolve) => {
    let computedScores: ComputeScores | null = null;

    const timeout = setTimeout(() => {
      resolve(null);
    }, timeoutDuration);

    Redis.subscribe(messageId, async (message) => {
      try {
        const response = formatCheckerResponse(JSON.parse(atob(message)));
        computedScores = await computeScore(response);

        clearTimeout(timeout);
        resolve({
          computedScores,
          response,
        });
      } catch (error) {
        clearTimeout(timeout);
        resolve(null);
      }
    });
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
