import matter from "gray-matter";
import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { Checkpoint, MDX, Module, prisma, SubModule } from "~/utils/db.server";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUserId } from "~/utils/session.server";
import { cache } from "~/utils/node-cache.server";
import { CHECKPOINT_STATUS, STATUS } from "~/utils/helpers";
import {
  computeScore,
  formatResponse,
  getRequestUrl,
  gradeFetch,
  LINT_CUTOFF_SCORE,
  TEST_CUTOFF_SCORE,
  TOTAL_CUTOFF_SCORE,
  updateModuleStatusAndFindNextModule,
  updateSubmoduleStatusAndFindNextSubmodule,
} from "~/utils/helpers.server";

//################
// Server uitls
//################
export async function getCheckpoint(request: Request, params: Params<string>) {
  const userId = await getUserId(request);
  const url = new URL(request.url).searchParams;
  const moduleOrSubmoduleId = url.get("moduleId") ?? url.get("submoduleId");
  const checkpointId = params.checkpointId;

  try {
    invariant(moduleOrSubmoduleId, "ID is required to get Checkpoint");
    invariant(checkpointId, "Checkpoint ID is required to get Checkpoint");

    const checkpoint = await prisma.checkpoint.findUniqueOrThrow({
      where: {
        id: checkpointId,
        OR: [
          { moduleId: { equals: moduleOrSubmoduleId } },
          { subModuleId: { equals: moduleOrSubmoduleId } },
        ],
        users: { some: { id: userId } },
      },
      include: {
        module: { include: { course: true } },
        subModule: { include: { module: { include: { course: true } } } },
      },
    });

    const path = checkpoint?.module
      ? "checkpoint.mdx"
      : `${checkpoint?.subModule?.slug}/checkpoint.mdx`;

    const repo =
      checkpoint?.module?.slug ??
      (checkpoint?.subModule?.module?.slug as string);

    const cacheKey = `checkpoint-${checkpointId}`;
    if (cache.has(cacheKey)) {
      return {
        checkpoint,
        checkpointContent: cache.get(cacheKey) as MDX,
      };
    }

    const { content: mdx } = await getContentFromGithub({
      repo,
      path,
    });

    const { data, content } = matter(mdx);
    const checkpointMdx = { data, content };
    cache.set<MDX>(cacheKey, checkpointMdx);
    return {
      checkpoint,
      checkpointContent: checkpointMdx,
    };
  } catch (error) {
    throw error;
  }
}

type CheckpointWithCourse = Checkpoint & {
  module: Module & { course: { id: string } };
  subModule: SubModule & { module: Module & { course: { id: string } } };
};

//################
// Action uitls
//################

export async function gradeCheckpoint(request: Request) {
  const { intent, userId, checkpointId, moduleOrSubmoduleId } =
    await getFormData(request);
  invariant(intent, "Intent is required to update Checkpoint");
  invariant(checkpointId, "Checkpoint ID is required to update Checkpoint");
  return await autoGradeCheckpoint(
    userId,
    checkpointId,
    moduleOrSubmoduleId,
    request
  );
}

/**
 * Auto grade a user
 * @param userGithubUsername - user's github username
 * @param path - path to checkpoint on github
 * @returns {}
 */
async function autoGradeCheckpoint(
  userId: string,
  checkpointId: string,
  moduleOrSubmoduleId: string,
  request: Request
) {
  try {
    const [user, checkpoint] = await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { githubUsername: true },
      }),
      getCurrentCheckpoint(userId, checkpointId, moduleOrSubmoduleId),
    ]);

    const username = user?.githubUsername as string;
    if (!username) {
      return formatResponse({ error: "Please, update your Github username." });
    }
    const testEnvironment = checkpoint?.testEnvironment;
    const repo =
      checkpoint?.module?.slug ??
      (checkpoint?.subModule?.module.slug as string);

    const path = getCheckpointPath(checkpoint as CheckpointWithCourse);
    const url = getRequestUrl({ username, path, repo });
    const response = await gradeFetch({ url, testEnvironment, request });
    const computedScores = await computeScore(response);
    const checkpointStatus = await updateCheckpointStatus({
      userId,
      checkpointId,
      ...computedScores,
    });
    if (checkpointStatus.status === CHECKPOINT_STATUS.COMPLETED) {
      if (checkpointStatus.moduleId !== null) {
        const { moduleId } = checkpointStatus;
        await updateModuleStatusAndFindNextModule({ userId, moduleId });
      } else {
        const { subModuleId } = checkpointStatus as { subModuleId: string };
        await updateSubmoduleStatusAndFindNextSubmodule({
          userId,
          subModuleId,
        });
      }
    }
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Update the checkpoint status
 * @param userId - user id
 * @param checkpointId - checkpoint id
 * @param checkpointScore - checkpoint score
 * @param totalLintsScore - total lints score
 * @param totalTestsScore - total tests score
 * @returns {Promise<Checkpoint>}
 */
async function updateCheckpointStatus({
  userId,
  checkpointId,
  totalScore: checkpointScore,
  totalLintsScore,
  totalTestsScore,
}: {
  userId: string;
  checkpointId: string;
  totalScore: number;
  totalLintsScore: number;
  totalTestsScore: number;
}) {
  const passedLint = totalLintsScore >= LINT_CUTOFF_SCORE;
  const passedTest = totalTestsScore >= TEST_CUTOFF_SCORE;
  const passedCheckpoint = checkpointScore >= TOTAL_CUTOFF_SCORE;
  const completed = passedLint && passedTest && passedCheckpoint;

  try {
    return prisma.checkpoint.update({
      where: { id: checkpointId, users: { some: { id: userId } } },
      data: {
        status: completed
          ? CHECKPOINT_STATUS.COMPLETED
          : CHECKPOINT_STATUS.IN_PROGRESS,
        score: Number(checkpointScore.toFixed(0)),
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get form data
 * @param request - request
 * @returns {Record<string, any>}
 */
async function getFormData(request: Request) {
  const formData = await request.formData();
  return {
    userId: await getUserId(request),
    intent: String(formData.get("intent")),
    checkpointId: String(formData.get("checkpointId")),
    moduleOrSubmoduleId: String(formData.get("itemId")),
  };
}

/**
 * Get the checkpoint path
 * @param checkpoint - checkpoint
 * @returns {string} - checkpoint path
 */
function getCheckpointPath(checkpoint: CheckpointWithCourse) {
  return checkpoint.module
    ? `${checkpoint.module.slug}-checkpoint`
    : `${checkpoint.subModule.module.slug}/sub-modules/${checkpoint.subModule.slug}-checkpoint`;
}

/**
 * Find an existing checkpoint
 * @param userId - user id
 * @param checkpointId - checkpoint id
 * @param itemId - module or sub-module id
 * @returns {Promise<Checkpoint>}
 */
async function getCurrentCheckpoint(
  userId: string,
  checkpointId: string,
  moduleOrSubmoduleId: string
) {
  try {
    return prisma.checkpoint.findUniqueOrThrow({
      where: {
        id: checkpointId,
        users: { some: { id: userId } },
        OR: [
          { moduleId: { equals: moduleOrSubmoduleId } },
          { subModuleId: { equals: moduleOrSubmoduleId } },
        ],
      },
      include: {
        module: { include: { course: true } },
        subModule: { include: { module: { include: { course: true } } } },
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function updateCourseProject(moduleId: string, userId: string) {
  try {
    const course = await prisma.course.findFirst({
      where: {
        modules: { some: { id: moduleId } },
        users: { some: { id: userId } },
      },
      include: { project: true },
    });

    if (!course?.project) throw new Error("Project not found.");
    await prisma.project.update({
      where: { id: course.project.id, contributors: { some: { id: userId } } },
      data: { status: STATUS.IN_PROGRESS },
    });
  } catch (error) {
    throw error;
  }
}
