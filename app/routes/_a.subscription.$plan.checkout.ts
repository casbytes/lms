import invariant from "tiny-invariant";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { getUserId } from "~/utils/session.server";
import { Paystack, TransactionInitialized } from "~/services/paystack.server";
import { prisma } from "~/utils/db.server";

export function loader() {
  return redirect("/");
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as "subscribe";
  const plan = params.plan;
  invariant(intent === "subscribe", "Invalid intent");
  invariant(plan, "No plan code found in params");

  try {
    const userId = await getUserId(request);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { email: true },
    });
    const res = await Paystack.initializeTransaction({
      email: user.email,
      plan,
    });
    if (!res.status) {
      throw redirect("/subscription?error=true");
    }
    return redirect(
      (res as TransactionInitialized).data.authorization_url,
      303
    );
  } catch (error) {
    throw error;
  }
}
