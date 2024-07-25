import matter from "gray-matter";
import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { prisma } from "~/utils/db.server";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUserId, getUser } from "~/utils/session.server";
import { ensurePrimary } from "~/utils/litefs.server";
import { CheckpointStatus, Status } from "~/constants/enums";
import { cache } from "~/utils/node-cache.server";

const { NODE_ENV } = process.env;
//################
// Server uitls
//################
const CUT_OFF_SCORE = 80;
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
            moduleProgressId: {
              equals: id,
            },
          },
          {
            subModuleProgressId: {
              equals: id,
            },
          },
        ],
        users: { some: { id: userId } },
      },
      include: {
        links: true,
        moduleProgress: {
          include: {
            courseProgress: true,
          },
        },
        subModuleProgress: {
          include: {
            moduleProgress: {
              include: {
                courseProgress: true,
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
        checkpointContent: cache.get(cacheKey),
      };
    }

    const path = checkpoint?.moduleProgress
      ? "checkpoint.mdx"
      : `${checkpoint?.subModuleProgress?.slug}/checkpoint.mdx`;

    const repo = checkpoint?.moduleProgress
      ? `${checkpoint?.moduleProgress?.slug}`
      : (checkpoint?.subModuleProgress?.moduleProgress?.slug as string);

    const { content } = await getContentFromGithub({
      repo,
      path,
    });

    const { data, content: mdx } = matter(content);
    cache.set(cacheKey, { data, mdx });
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
        include: {
          subModuleProgress: true,
          moduleProgress: true,
        },
      });

      const checkpointPath = checkpoint?.moduleProgressId
        ? checkpoint?.moduleProgress?.slug
        : checkpoint?.subModuleProgress?.slug;

      if (checkpoint?.gradingMethod === "AUTO") {
        const userGithubUsername = user?.githubUsername;
        if (!userGithubUsername) {
          return {
            success: false,
            errors: [{ formError: "Please update your github username" }],
          };
        }
        const checkpointRepo = `${userGithubUsername}/${checkpointPath}-checkpoint`;
        /**
         * Make some updates before returning response
         */
        return await autoGrade(userGithubUsername, checkpointRepo);
      } else {
        return await submitTask(checkpointId, userId);
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
async function autoGrade(userGithubUsername: string, checkpointRepo: string) {
  console.log(userGithubUsername, checkpointRepo);
  return null;
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
      status: CheckpointStatus.SUBMITTED,
    },
  });
  if (!checkpoint) {
    return formatResponse({
      status: "error",
      message: "Failed to submit task",
    });
  }
  return formatResponse({
    status: "success",
    message: "Task submitted successfully",
  });
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
      status: "error",
      message: "Failed to add link",
    });
  }
  return formatResponse({
    status: "success",
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
      status: "error",
      message: "Failed to delete link",
    });
  }
  return formatResponse({
    status: "success",
    message: "Link deleted successfully",
  });
}

/**
 * Formats the response
 * @param status - The status of the response
 * @param message - The message of the response
 */
function formatResponse({
  status,
  message,
}: {
  status: string;
  message: string;
}) {
  return { status, message };
}
