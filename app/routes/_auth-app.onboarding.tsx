import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useRouteError,
  useNavigation,
} from "@remix-run/react";
import { CheckCircle } from "lucide-react";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaArrowRightLong } from "react-icons/fa6";
import { Container } from "~/components/container";
import { ErrorUI } from "~/components/error-ui";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { prisma } from "~/libs/prisma";
import { readContent } from "~/utils/read-mdx-content.server";
import { getUser } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await getUser(request);
    const content = await readContent("onboarding.mdx");
    return json({ content, user });
  } catch (error) {
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = String(formData.get("userId"));
  try {
    if (intent === "mark-as-completed" && userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { completedOnboarding: true },
      });
      return redirect("/dashboard");
    } else {
      throw new Error("Unknown onboarding intent.");
    }
  } catch (error) {
    throw error;
  }
}

export default function Onboarding() {
  const { user, content } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === "mark-as-completed";

  return (
    <Container>
      <div className="mx-auto max-w-4xl">
        <PageTitle title="Onboarding" className="text-lg mb-6" />
        <Markdown source={content} />
        {user.completedOnboarding === true ? (
          <Button asChild className="flex items-center mt-8 text-lg">
            <Link to="/dashboard">
              Dashboard <FaArrowRightLong className="ml-4" />
            </Link>
          </Button>
        ) : (
          <Form method="post" className="block">
            <input
              type="hidden"
              name="intent"
              value="mark-as-completed"
              required
            />
            <input type="hidden" name="userId" value={user.userId} required />
            <Button
              type="submit"
              className="flex w-full items-center mt-8 text-lg"
            >
              {isLoading ? (
                <CgSpinnerTwo className="mr-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-4" />
              )}
              mark as completed
            </Button>
          </Form>
        )}
      </div>
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorUI error={error} />;
}
