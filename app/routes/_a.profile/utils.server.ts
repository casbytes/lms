import { deleteStripeCustomer } from "~/services/stripe.server";
import { prisma } from "~/utils/db.server";
import { getUserId, signOut } from "~/utils/session.server";

export async function deleteUser(request: Request) {
  const formData = await request.formData();
  const intent = formData.get("intent") as "deleteAccount" | "updateProfile";
  const userId = await getUserId(request);

  try {
    if (intent !== "deleteAccount") {
      throw new Error("Invalid form data.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error("User not found.");
    }
    await Promise.all([
      /**
       * Delete user from Stripe
       * The user subscription will be canceled and the customer will be deleted
       */
      deleteStripeCustomer({
        stripeCustomerId: user.stripeCustomerId!,
      }),
      prisma.courseProgress.deleteMany({
        where: { users: { some: { id: userId } } },
      }),
      /**
       * Delete individual user modules progress if any
       */
      prisma.moduleProgress.deleteMany({
        where: { users: { some: { id: userId } } },
      }),
      prisma.user.delete({
        where: { id: user.id },
      }),
    ]);

    /**
     * !Send googbye email
     */
    return signOut(request);
  } catch (error) {
    throw error;
  }
}

export async function updateUser(request: Request) {
  const formData = await request.formData();
  const intent = formData.get("intent") as "updateProfile";
  const name = formData.get("name") as string;
  const githubUsername = formData.get("githubUsername") as string | null;
  const userId = await getUserId(request);

  try {
    if (intent !== "updateProfile") {
      throw new Error("Invalid form data.");
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, githubUsername },
    });
    if (!user) {
      throw new Error("user not found");
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
