import invariant from "tiny-invariant";
import { InternalServerError, NotFoundError } from "~/errors";
import { prisma } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

export async function getTest(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const id = searchParams.get("moduleId") ?? searchParams.get("submoduleId");

  try {
    invariant(id, "ID is required to get Test");
    const userId = await getUserId(request);

    const test = await prisma.test.findFirst({
      where: {
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
        moduleProgress: true,
        subModuleProgress: true,
      },
    });
    if (!test) {
      throw new NotFoundError("Test not found.");
    }
    return test;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError();
  }
}
