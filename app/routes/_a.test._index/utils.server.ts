import invariant from "tiny-invariant";
import { prisma } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

export async function getTest(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const moduleOrSubmoduleId =
    searchParams.get("moduleId") ?? searchParams.get("submoduleId");
  invariant(moduleOrSubmoduleId, "ID is required to get Test");

  try {
    const userId = await getUserId(request);
    return await prisma.test.findFirstOrThrow({
      where: {
        OR: [
          { moduleId: { equals: moduleOrSubmoduleId } },
          { subModuleId: { equals: moduleOrSubmoduleId } },
        ],
        users: { some: { id: userId } },
      },
      include: { module: true, subModule: true },
    });
  } catch (error) {
    throw error;
  }
}
