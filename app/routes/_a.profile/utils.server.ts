import invariant from "tiny-invariant";
import { STRIPE } from "~/services/stripe.server";
import { prisma } from "~/utils/db.server";
import { getUserId, signOut } from "~/utils/session.server";

export async function handleActions(request: Request) {
  const formData = await request.formData();
  const userId = await getUserId(request);
  const intent = formData.get("intent") as "deleteAccount" | "updateProfile";
  switch (intent) {
    case "deleteAccount":
      return deleteUser(formData, userId, request);
    case "updateProfile":
      return updateUser(formData, userId);
    default:
      throw new Error("Invalid intent.");
  }
}

export async function deleteUser(
  formData: FormData,
  userId: string,
  request: Request
) {
  const intent = formData.get("intent") as "deleteAccount";
  invariant(intent === "deleteAccount", "No intent found in form data");

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, stripeCustomerId: true },
    });

    await prisma.$transaction(async (txn) => {
      await STRIPE.deleteCustomer(user.stripeCustomerId!),
        await txn.course.deleteMany({
          where: { users: { some: { id: userId } } },
        }),
        /**
         * Delete individual user modules progress if any
         */
        await txn.module.deleteMany({
          where: { users: { some: { id: userId } } },
        }),
        await txn.user.delete({
          where: { id: user.id },
        });
    });

    /**
     * !Send googbye email
     */
    return signOut(request);
  } catch (error) {
    throw error;
  }
}

export async function updateUser(formData: FormData, userId: string) {
  const intent = formData.get("intent") as "updateProfile";
  const name = formData.get("name") as string;
  const githubUsername = formData.get("githubUsername") as string | null;
  invariant(intent === "updateProfile", "No intent found in form data");

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, githubUsername },
    });
    return { success: true };
  } catch (error) {
    throw error;
  }
}
