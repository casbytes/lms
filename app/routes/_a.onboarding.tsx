import matter from "gray-matter";
import invariant from "tiny-invariant";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { FiCheckCircle } from "react-icons/fi";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaArrowRightLong } from "react-icons/fa6";
import { readContent } from "~/utils/helpers.server";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { getUser, getUserId } from "~/utils/session.server";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [user, content] = await Promise.all([
      getUser(request),
      readContent("onboarding.mdx"),
    ]);
    const mdx = matter(content);
    return json({ mdx, user });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = await getUserId(request);
  invariant(intent === "markAsCompleted", "Invalid intent.");

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { completedOnboarding: true },
    });
    return redirect("/dashboard");
  } catch (error) {
    console.error(error);

    throw error;
  }
}

export default function Onboarding() {
  const { user, mdx } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === "markAsCompleted";

  return (
    <Container>
      <div className="mx-auto max-w-4xl">
        <PageTitle title="onboarding" className="text-lg mb-6" />
        <Markdown source={mdx.content} />
        {/* iframe for video */}
        {user.completedOnboarding ? (
          <Button asChild className="flex items-center mt-8 text-lg">
            <Link to="/dashboard">
              Dashboard <FaArrowRightLong className="ml-4" />
            </Link>
          </Button>
        ) : (
          <Form method="post" className="block">
            <Button
              type="submit"
              name="intent"
              value="markAsCompleted"
              className="flex w-full items-center mt-8 text-lg"
            >
              {isLoading ? (
                <CgSpinnerTwo className="mr-4 animate-spin" />
              ) : (
                <FiCheckCircle className="mr-4" />
              )}
              mark as completed
            </Button>
          </Form>
        )}
      </div>
    </Container>
  );
}
