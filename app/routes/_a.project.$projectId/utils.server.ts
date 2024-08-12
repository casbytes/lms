import matter from "gray-matter";
import invariant from "tiny-invariant";
import { Params } from "@remix-run/react";
import { MDX, prisma, Project } from "~/utils/db.server";
import { getContentFromGithub } from "~/utils/octokit.server";
import { getUserId } from "~/utils/session.server";
import { cache } from "~/utils/node-cache.server";
import {
  computeScore,
  formatResponse,
  getRequestUrl,
  gradeFetch,
  LINT_CUTOFF_SCORE,
  TEST_CUTOFF_SCORE,
  TOTAL_CUTOFF_SCORE,
} from "~/utils/helpers.server";
import { STATUS } from "~/utils/helpers";

/**
 * Fetch the project and its content from GitHub or cache.
 * @param request - HTTP Request object
 * @param params - Request parameters
 * @returns {Promise<{project: Project, projectContent: MDX}>}
 */
export async function getProject(request: Request, params: Params<string>) {
  const projectId = params.projectId;
  invariant(projectId, "Project ID is required to get Project");

  const cacheKey = `project-${projectId}`;
  const userId = await getUserId(request);

  const project = await prisma.project.findUniqueOrThrow({
    where: {
      id: projectId,
      contributors: { some: { id: userId } },
    },
    include: {
      course: true,
    },
  });
  if (cache.has(cacheKey)) {
    return { project, projectContent: cache.get(cacheKey) as MDX };
  }

  const repo = "meta";
  const path = `course-projects/${project.course.slug}.mdx`;
  const { content: mdx } = await getContentFromGithub({ repo, path });
  const { data, content } = matter(mdx);

  cache.set<MDX>(cacheKey, { data, content });
  return { project, projectContent: { data, content } };
}

/**
 * Update a project based on form data.
 * @param request - HTTP Request object
 * @returns {Promise<ApiResponse>}
 */
export async function updateProject(request: Request) {
  const { userId, intent, projectId, courseId } = await getFormData(request);
  invariant(intent, "Intent is required to update Project");
  invariant(projectId, "Project ID is required to update Project");
  invariant(courseId, "Course ID is required to update Project");
  return await autoGradeProject(projectId, courseId, userId, request);
}

/**
 * Auto-grade a project based on lints and tests.
 * @param projectId - Project ID
 * @param courseId - Course ID
 * @param userId - User ID
 * @returns {Promise<ApiResponse>}
 */
async function autoGradeProject(
  projectId: string,
  courseId: string,
  userId: string,
  request: Request
) {
  const [user, project] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { githubUsername: true },
    }),
    getCurrentProject(userId, projectId, courseId),
  ]);

  const username = user.githubUsername;
  if (!username) {
    return formatResponse({ error: "Please, update your Github username." });
  }

  const testEnvironment = project.testEnvironment;
  const repo = `${username}/${project.slug}`;
  const path = project.slug;

  const url = getRequestUrl({ username, path, repo });
  const response = await gradeFetch({ url, testEnvironment, request });
  const computedScore = await computeScore(response);
  const updatedProject = await updateProjectStatus({
    userId,
    projectId,
    ...computedScore,
  });
  if (updatedProject.status === STATUS.COMPLETED) {
    await updateCourseStatus(project);
  }
  return response;
}

/**
 * Find an existing project.
 * @param userId - User ID
 * @param projectId - Project ID
 * @param courseId - Course ID
 * @returns {Promise<Project>}
 */
async function getCurrentProject(
  userId: string,
  projectId: string,
  courseId: string
): Promise<Project> {
  try {
    return prisma.project.findUniqueOrThrow({
      where: {
        id: projectId,
        courseId,
        contributors: { some: { id: userId } },
      },
      include: {
        course: true,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update project status based on the computed scores.
 * @param userId - User ID
 * @param projectId - Project ID
 * @param projectScore - Computed project score
 * @param totalLintsScore - Computed lints score
 * @param totalTestsScore - Computed tests score
 * @returns {Promise<Project>}
 */
async function updateProjectStatus({
  userId,
  projectId,
  totalScore: projectScore,
  totalLintsScore,
  totalTestsScore,
}: {
  userId: string;
  projectId: string;
  totalScore: number;
  totalLintsScore: number;
  totalTestsScore: number;
}): Promise<Project> {
  const passedLint = totalLintsScore >= LINT_CUTOFF_SCORE;
  const passedTest = totalTestsScore >= TEST_CUTOFF_SCORE;
  const passedCheckpoint = projectScore >= TOTAL_CUTOFF_SCORE;
  const completed = passedLint && passedTest && passedCheckpoint;

  try {
    return prisma.project.update({
      where: { id: projectId, contributors: { some: { id: userId } } },
      data: {
        status: completed ? STATUS.COMPLETED : STATUS.IN_PROGRESS,
        score: projectScore,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update the course status if the project is completed.
 * @param project - Project object
 * @returns {Promise<Course>}
 */
async function updateCourseStatus(project: Project) {
  try {
    return await prisma.course.update({
      where: { id: project.courseId },
      data: {
        status: STATUS.COMPLETED,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get form data from the request.
 * @param request - HTTP Request object
 * @returns {Promise<Record<string, any>>}
 */
async function getFormData(request: Request) {
  const formData = await request.formData();
  return {
    userId: await getUserId(request),
    intent: String(formData.get("intent")),
    projectId: String(formData.get("itemId")),
    courseId: String(formData.get("courseId")),
  };
}
