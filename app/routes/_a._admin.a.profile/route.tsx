import React from "react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useNavigation,
  Form,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { getUser, getUserId } from "~/utils/session.server";
import { prisma } from "~/utils/db.server";
import { toast } from "~/components/ui/use-toast";
import { CgSpinnerTwo } from "react-icons/cg";

export async function loader({ request }: LoaderFunctionArgs) {
  return await getUser(request);
}

export async function action({ request }: ActionFunctionArgs) {
  // eslint-disable-next-line no-useless-catch
  try {
    const userId = await getUserId(request);
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });
    if (!user) {
      throw new Error("user not found");
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
}

export default function AdminEventsRoute() {
  const [name, setName] = React.useState("");
  const [isDisabled, setIsDisabled] = React.useState(true);
  const user = useLoaderData<typeof loader>();
  const ad = useActionData<typeof action>();
  const n = useNavigation();

  const isUpdating = n.formData?.get("intent") === "updateProfile";

  React.useEffect(() => {
    if (user) {
      setName(user.name!);
    }
  }, [user]);

  React.useEffect(() => {
    if (name === user.name) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [name, user.name, setIsDisabled]);

  React.useEffect(() => {
    if (ad) {
      if (ad?.success) {
        toast({
          title: "Profile updated",
        });
      } else {
        toast({
          title: "Error updating profile",
          variant: "destructive",
        });
      }
    }
  }, [ad]);

  return (
    <Container className="max-w-3xl">
      <PageTitle title="admin profile" />
      <Card className="max-w-lg mt-12 mx-auto py-4">
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="flex flex-col gap-6">
            <Input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="name"
            />
            <Input
              type="email"
              name="email"
              value={user.email}
              placeholder="email"
              readOnly
              className="cursor-not-allowed"
            />
            <Input
              name="role"
              value={user.role}
              placeholder="role"
              readOnly
              className="cursor-not-allowed"
            />
            <Button
              type="submit"
              name="intent"
              value="updateProfile"
              className="self-end disabled:cursor-not-allowed"
              disabled={isDisabled || isUpdating}
            >
              {isUpdating ? <CgSpinnerTwo className="mr-2" /> : null}
              Update
            </Button>
          </Form>
        </CardContent>
      </Card>
    </Container>
  );
}
