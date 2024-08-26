import React from "react";
import { useNavigation, Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CgSpinnerTwo } from "react-icons/cg";
import { User } from "~/utils/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

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
    <Card className="bg-sky-300/50 border-sky-500 shadow-lg">
      <CardHeader className="mb-4">
        <CardTitle className="text-sky-800 font-mono mx-auto">
          Update profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form method="post" className="flex flex-col gap-10">
          <Input
            name="name"
            value={values.name}
            onChange={handleValuesChange}
            placeholder="name"
            className="text-lg"
          />
          <Input
            name="githubUsername"
            value={values.githubUsername}
            onChange={handleValuesChange}
            placeholder="Github Username"
            className="text-lg"
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
  );
}
