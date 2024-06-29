import matter from "gray-matter";
import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { BadRequestError, InternalServerError, NotFoundError } from "~/errors";
import { prisma } from "~/utils/db.server";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUserId, getUser } from "~/utils/session.server";
import { CheckpointStatus } from "~/constants/enums";

//################
// Server uitls
//################
const CUT_OFF_SCORE = 80;
export async function getCheckpoint(request: Request, params: Params<string>) {
  const user = await getUser(request);
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const id = searchParams.get("moduleId") ?? searchParams.get("submoduleId");
  const checkpointId = params.checkpointId;

  try {
    invariant(id, "ID is required to get Test");
    invariant(checkpointId, "Checkpoint ID is required to get Test");
    const userId = await getUserId(request);

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
        comments: {
          include: {
            user: true,
          },
        },
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
      throw new NotFoundError("Checkpoint not found.");
    }

    /**
     * If the checkpoint is graded and the user has scored above the cut off score
     * and the user is subscribed to the platform, update the next module or sudmodule after the checkpoint module or submodule to in progress then redirect them to the next module or submodule
     */
    if (
      checkpoint.status === CheckpointStatus.GRADED &&
      checkpoint.score >= CUT_OFF_SCORE &&
      user.subscribed
    ) {
      //update the next modules or sudmodule after the checkpoint module or submodule to in progress
      const nextModuleOrSubmoduleId: string | null = null;
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

    return {
      checkpoint,
      checkpointContent: { data, mdx },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError();
  }
}

//################
// Action uitls
//################

export async function updateCheckpoint(request: Request) {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const checkpointId = formData.get("itemId") as string;
  invariant(intent, "Intent is required to update Checkpoint");
  invariant(checkpointId, "Checkpoint ID is required to update Checkpoint");

  switch (intent) {
    case "submitTask":
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

    /**
     * Add link
     */
    case "addLink":
      const title = formData.get("linkType") as string;
      const url = formData.get("url") as string;
      invariant(title, "Title is required to add link");
      invariant(url, "URL is required to add link");

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

    /**
     * Delete link
     */
    case "deleteLink":
      const linkId = formData.get("linkId") as string;
      invariant(linkId, "Link ID is required to delete link");
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

    case "addComment":
      const comment = formData.get("comment") as string;
      invariant(comment, "Comment is required to add comment");

      const createdComment = await prisma.taskComment.create({
        data: {
          content: comment,
          user: {
            connect: {
              id: userId,
            },
          },
          checkpoint: {
            connect: {
              id: checkpointId,
            },
          },
        },
      });
      if (!createdComment) {
        throw new InternalServerError("Failed to create comment");
      }
      return null;

    case "updateComment":
      const commentId = formData.get("commentId") as string;
      const content = formData.get("comment") as string;
      invariant(commentId, "Comment ID is required to update comment");
      invariant(content, "Content is required to update comment");

      const updatedComment = await prisma.taskComment.update({
        where: {
          id: commentId,
          user: {
            id: userId,
          },
        },
        data: {
          content,
        },
      });
      if (!updatedComment) {
        throw new InternalServerError("Failed to update comment");
      }
      return null;

    case "deleteComment":
      const commentId2 = formData.get("commentId") as string;
      invariant(commentId2, "Comment ID is required to delete comment");

      const deletedComment = await prisma.taskComment.delete({
        where: {
          id: commentId2,
        },
      });
      if (!deletedComment) {
        throw new NotFoundError(`Comment with ID ${commentId2} not found`);
      }
      return null;
    default:
      throw new BadRequestError("Invalid intent");
  }
}

function formatResponse({
  status,
  message,
}: {
  status: string;
  message: string;
}) {
  return { status, message };
}
