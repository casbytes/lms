import { Params } from "@remix-run/react";
import matter from "gray-matter";
import invariant from "tiny-invariant";
import { InternalServerError, NotFoundError } from "~/errors";
import { prisma } from "~/libs/prisma.server";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUser } from "~/utils/sessions.server";

//################
// Server uitls
//################
export async function getCheckpoint(request: Request, params: Params<string>) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const id = searchParams.get("moduleId") ?? searchParams.get("submoduleId");
  const checkpointId = params.checkpointId;

  try {
    invariant(id, "ID is required to get Test");
    invariant(checkpointId, "Checkpoint ID is required to get Test");
    const user = await getUser(request);

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
        users: { some: { id: user.id } },
      },
      include: {
        moduleProgress: true,
        subModuleProgress: {
          include: {
            moduleProgress: true,
          },
        },
      },
    });
    if (!checkpoint) {
      throw new NotFoundError("Checkpoint not found.");
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
    console.error(error);

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
  const formData = await request.formData();
  const intent = formData.get("intent");
  const links = formData.getAll("links");
  const userId = formData.get("userId");
  const checkpointId = formData.get("checkpointId");
  console.log({ intent, links, userId, checkpointId });
  return null;
}
