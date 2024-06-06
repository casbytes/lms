import invariant from "tiny-invariant";
import { InternalServerError, NotFoundError } from "~/errors";
import { prisma } from "~/libs/prisma.server";
import { getUser } from "~/utils/sessions.server";

export async function getTest(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const id = searchParams.get("moduleId") ?? searchParams.get("submoduleId");

  try {
    invariant(id, "ID is required to get Test");
    const user = await getUser(request);

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
        users: { some: { id: user.id } },
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
