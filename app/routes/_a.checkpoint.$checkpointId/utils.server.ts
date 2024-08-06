import matter from "gray-matter";
import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { prisma } from "~/utils/db.server";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUserId, getUser } from "~/utils/session.server";
import { ensurePrimary } from "~/utils/litefs.server";
import { cache } from "~/utils/node-cache.server";
import { CHECKPOINT_STATUS } from "~/utils/helpers";

const { NODE_ENV } = process.env;

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

    type CheckpointContent = {
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      };
      mdx: string;
    };

    if (cache.has(cacheKey)) {
      return {
        checkpoint,
        checkpointContent: cache.get(cacheKey) as CheckpointContent,
      };
    }

    const path = checkpoint?.module
      ? "checkpoint.mdx"
      : `${checkpoint?.subModule?.slug}/checkpoint.mdx`;

    const repo = checkpoint?.module
      ? `${checkpoint?.module?.slug}`
      : (checkpoint?.subModule?.module?.slug as string);

    const { content } = await getContentFromGithub({
      repo,
      path,
    });

    const { data, content: mdx } = matter(content);
    cache.set<CheckpointContent>(cacheKey, { data, mdx });
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
export async function updateCheckpoint(request: Request) {
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

  switch (intent) {
    /**
     * Add link
     */
    case "addLink": {
      const title = formData.get("linkType") as string;
      const url = formData.get("url") as string;
      invariant(title, "Title is required to add link");
      invariant(url, "URL is required to add link");
      return await addLink(title, url, checkpointId);
    }

    case "deleteLink": {
      const linkId = formData.get("linkId") as string;
      invariant(linkId, "Link ID is required to delete link");
      return await deleteLink(linkId);
    }

    case "submitTask": {
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: checkpointId },
        select: { gradingMethod: true },
      });
      if (!checkpoint) {
        return formatResponse({
          error: "Checkpoint not found",
        });
      }
      if (checkpoint?.gradingMethod === "AUTO") {
        const userGithubUsername = user?.githubUsername;
        if (!userGithubUsername) {
          return formatResponse({
            error: "Please add your github username to your profile.",
          });
        }
        return await autoGrade(userId, checkpointId);
      } else {
        return await submitTask(userId, checkpointId);
      }
    }

    default:
      throw new Error("Invalid intent");
  }
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
  const testEnvironment = "node";
  const checkpointPath = checkpoint?.moduleId
    ? `${checkpoint.module?.title}-checkpoint`
    : `${checkpoint!.subModule?.module.title}/sub-modules/${
        checkpoint?.subModule?.title
      }-checkpoint`;

  const checkpointRepo = checkpoint?.moduleId
    ? checkpoint.module?.title
    : checkpoint!.subModule?.module.title;

  const baseUrl =
    NODE_ENV === "production"
      ? process.env.CHECKER_URL
      : "http://localhost:8080";
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
 * Submits a task
 * @param checkpointId - The ID of the checkpoint to submit
 * @param userId - The ID of the user submitting the task
 */
async function submitTask(checkpointId: string, userId: string) {
  const checkpoint = await prisma.checkpoint.update({
    where: {
      id: checkpointId,
      users: {
        some: {
          id: userId,
        },
      },
    },
    data: {
      status: CHECKPOINT_STATUS.IN_PROGRESS,
    },
  });
  if (!checkpoint) {
    return formatResponse({
      error: "Failed to submit task, please try again",
    });
  }
  return formatResponse({
    message: "Task submitted successfully",
  });
}

/**
 * Updates the next module or sub module progress
 * @param checkpointId - The ID of the checkpoint to update the next module or sub module progress
 * @param userId - The ID of the user to update the next module or sub module progress for
 */
async function updateNextModuleOrSubModule(
  userId: string,
  checkpointId: string,
  data?: ApiResponse
) {
  return null;
}

/**
 * Adds a link
 * @param title - The title of the link
 * @param url - The URL of the link
 * @param checkpointId - The ID of the checkpoint to add the link to
 */
async function addLink(title: string, url: string, checkpointId: string) {
  const createdLink = await prisma.link.create({
    data: {
      title,
      url,
      checkpoint: {
        connect: {
          id: checkpointId,
        },
      },
    },
  });
  if (!createdLink) {
    return formatResponse({
      error: "Failed to add link",
    });
  }
  return formatResponse({
    message: "Link added successfully",
  });
}

/**
 * Deletes a link
 * @param linkId - The ID of the link to delete
 */
async function deleteLink(linkId: string) {
  const link = await prisma.link.delete({
    where: {
      id: linkId,
    },
  });
  if (!link) {
    return formatResponse({
      error: "Failed to delete link",
    });
  }
  return formatResponse({
    message: "Link deleted successfully",
  });
}

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
