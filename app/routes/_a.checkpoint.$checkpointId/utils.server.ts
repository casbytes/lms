import matter from "gray-matter";
import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { MDX, prisma } from "~/utils/db.server";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUserId, getUser } from "~/utils/session.server";
import { ensurePrimary } from "~/utils/litefs.server";
import { cache } from "~/utils/node-cache.server";
import { CHECKPOINT_STATUS } from "~/utils/helpers";

const { NODE_ENV } = process.env;
const MODE = NODE_ENV;

type Message = {
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType: string;
  messageId: string;
  endLine: number;
  endColumn: number;
};

type LintResult = {
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
};

type AssertionResult = {
  ancestorTitles: string[];
  fullName: string;
  status: string;
  title: string;
  duration: number;
  failureMessages: string[];
  meta: Record<string, unknown>;
};

type TestResultDetail = {
  assertionResults: AssertionResult[];
  startTime: number;
  endTime: number;
  status: string;
  message: string;
  name: string;
};

type Snapshot = {
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
};

type TestResults = {
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
};

type ApiResponse = {
  lintResults: LintResult[] | null;
  testResults: TestResults | null;
  error: string | null;
};

//################
// Server uitls
//################
export async function getCheckpoint(request: Request, params: Params<string>) {
  /**
   * Ensure to mutate using the primary instance.
   */
  if (NODE_ENV === "production") {
    await ensurePrimary();
  }
  const userId = await getUserId(request);
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const id = searchParams.get("moduleId") ?? searchParams.get("submoduleId");
  const checkpointId = params.checkpointId;

  try {
    invariant(id, "ID is required to get Checkpoint");
    invariant(checkpointId, "Checkpoint ID is required to get Checkpoint");

    const checkpoint = await prisma.checkpoint.findFirst({
      where: {
        id: checkpointId,
        OR: [
          {
            moduleId: {
              equals: id,
            },
          },
          {
            subModuleId: {
              equals: id,
            },
          },
        ],
        users: { some: { id: userId } },
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        subModule: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!checkpoint) {
      throw new Error("Checkpoint not found.");
    }

    const cacheKey = `checkpoint-${checkpointId}`;

    if (cache.has(cacheKey)) {
      return {
        checkpoint,
        checkpointContent: cache.get(cacheKey) as MDX,
      };
    }

    const path = checkpoint?.module
      ? "checkpoint.mdx"
      : `${checkpoint?.subModule?.slug}/checkpoint.mdx`;

    const repo =
      checkpoint?.module?.slug ??
      (checkpoint?.subModule?.module?.slug as string);

    const { content: mdx } = await getContentFromGithub({
      repo,
      path,
    });

    const { data, content } = matter(mdx);
    cache.set<MDX>(cacheKey, { data, content });
    return {
      checkpoint,
      checkpointContent: { data, mdx },
    };
  } catch (error) {
    throw error;
  }
}

//################
// Action uitls
//################
const CUT_OFF_SCORE = 80;
export async function gradeCheckpoint(request: Request) {
  const userId = await getUserId(request);
  const user = await getUser(request);
  const formData = await request.formData();
  const checkpointId = formData.get("itemId") as string;
  const intent = formData.get("intent") as
    | "addLink"
    | "deleteLink"
    | "submitTask";
  invariant(intent, "Intent is required to update Checkpoint");
  invariant(checkpointId, "Checkpoint ID is required to update Checkpoint");
}

/**
 * Auto grade a user
 * @param userGithubUsername - user's github username
 * @param path - path to checkpoint on github
 * @returns {}
 */
async function autoGrade(userId: string, checkpointId: string) {
  const [user, checkpoint] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { githubUsername: true },
    }),
    prisma.checkpoint.findUnique({
      where: { id: checkpointId },
      include: {
        module: true,
        subModule: {
          include: {
            module: true,
          },
        },
      },
    }),
  ]);

  const userGithubUsername = user!.githubUsername;
  if (!userGithubUsername) {
    return formatResponse({ error: "User does not have a github username" });
  }
  const testEnvironment = checkpoint?.testEnvironment ?? "node";
  const checkpointPath = checkpoint?.moduleId
    ? `${checkpoint.module?.slug}-checkpoint`
    : `${checkpoint!.subModule?.module.slug}/sub-modules/${
        checkpoint?.subModule?.title
      }-checkpoint`;

  const checkpointRepo =
    checkpoint?.module?.slug ?? checkpoint?.subModule?.module.slug;

  const baseUrl =
    MODE === "production" ? process.env.CHECKER_URL : "http://localhost:8080";
  const url = `${baseUrl}/${userGithubUsername}?checkpointPath=${checkpointPath}&checkpointRepo=${checkpointRepo}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-Forwarded-For": "localhost",
      "X-Test-Env": testEnvironment,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return formatResponse({
      error: "Failed to auto grade checkpoint, please try again",
    });
  }
  const data: ApiResponse = await response.json();
  return formatResponse({
    ...data,
  });
}

/**
 * Format the response
 * @param error - error message
 * @param message - message
 * @param lintReulsts - lint results
 * @param testResults - test results
 * @returns {ApiResponse}
 */
function formatResponse({
  error = null,
  message = null,
  lintReulsts = null,
  testResults = null,
}: {
  error?: string | null;
  message?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lintReulsts?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testResults?: any;
}) {
  return { error, message, lintReulsts, testResults };
}
