import React from "react";
import { useNavigation, Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CgSpinnerTwo } from "react-icons/cg";
import { User } from "~/utils/db.server";

// export async function action({ request }: ActionFunctionArgs) {
//   // eslint-disable-next-line no-useless-catch
//   try {
//     const userId = await getUserId(request);
//     const formData = await request.formData();
//     const name = formData.get("name") as string;
//     const user = await prisma.user.update({
//       where: { id: userId },
//       data: { name },
//     });
//     if (!user) {
//       throw new Error("user not found");
//     }
//     return { success: true };
//   } catch (error) {
//     throw error;
//   }
// }

export function UpdateUserForm({ user }: { user: User }) {
  const [values, setValues] = React.useState({ name: "", githubUsername: "" });
  const [isDisabled, setIsDisabled] = React.useState(true);

  const n = useNavigation();
  const isUpdating = n.formData?.get("intent") === "updateProfile";

  React.useEffect(() => {
    if (user) {
      setValues({
        name: user.name!,
        githubUsername: user.githubUsername ?? "",
      });
    }
  }, [user]);

  React.useEffect(() => {
    if (
      Object.values(values).every(
        (v) => !v || v === user.name || v === user.githubUsername
      )
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [setIsDisabled, user.githubUsername, user.name, values]);

  function handleValuesChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <Form
      method="post"
      className="flex flex-col gap-8 bg-sky-300/50 rounded-md p-8"
    >
      <h2 className="text-2xl text-sky-800 font-bold text-center">
        Update profile
      </h2>

      <Input
        name="name"
        value={values.name}
        onChange={handleValuesChange}
        placeholder="name"
      />
      <Input
        name="githubUsername"
        value={values.githubUsername}
        onChange={handleValuesChange}
        placeholder="Github Username"
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
  );
}
