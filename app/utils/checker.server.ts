import { TEST_ENV } from "./helpers";
import { customFetch } from "./helpers.server";

const { PYTHON_CHECKER_URL, JAVASCRIPT_CHECKER_URL } = process.env;

/**
 * Get the request URL
 * @param userGithubUsername - user's github username
 * @param checkpointPath - checkpoint path
 * @param checkpointRepo - checkpoint repo
 * @returns {string} - request URL
 */
export function getRequestUrl({
  path,
  repo,
  username,
  testEnvironment,
}: {
  username: string;
  path: string;
  repo: string;
  testEnvironment: string;
}) {
  let baseUrl: string;
  if (testEnvironment === TEST_ENV.PYTHON) {
    baseUrl = PYTHON_CHECKER_URL;
  } else {
    baseUrl = JAVASCRIPT_CHECKER_URL;
  }
  return `${baseUrl}/${username}?path=${path}&repo=${repo}`;
}

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
 * Fetch the checkpoint and grade it
 * @param url - URL to send the POST request to
 * @param testEnvironment - Test environment identifier
 * @param request - The original Request object containing the host and body
 * @returns {Promise<ApiResponse>} - The API response, formatted as needed
 */
export async function gradeFetch({
  url,
  testEnvironment,
  request,
}: {
  url: string;
  testEnvironment: string;
  request: Request;
}) {
  try {
    const host = request.headers.get("X-Forwarded-For") as string;

    const headers = {
      "Content-Type": "application/json",
      "X-Forwarded-For": host,
      "X-Test-Env": testEnvironment,
    };

    const { data, error } = await customFetch<ApiResponse>(url, {
      method: "POST",
      headers,
    });

    if (error) {
      throw new Error(error);
    }

    return formatCheckerResponse(data!);
  } catch (error) {
    const errorMessage = `Failed to grade checkpoint. Error: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    return formatCheckerResponse({ error: errorMessage });
  }
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
