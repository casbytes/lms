import { useNavigate, useNavigation } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { BsXCircle } from "react-icons/bs";

type ErrorUIProps = {
  error: Error | null | undefined | unknown;
};

export function ErrorUI({ error }: ErrorUIProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  return (
    <Card className="flex flex-col gap-4 max-w-3xl mx-auto bg-red-200 overflow-x-auto mt-10">
      <CardHeader>
        <BsXCircle size={100} className="text-red-500  mx-auto font-bold" />
        <CardTitle className="capitalize text-4xl font-medium text-center">
          Error!
        </CardTitle>
        <CardDescription className="capitalize text-2xl font-medium text-center">
          Ooops! An error occured.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-center text-red-500">
          {error instanceof Error
            ? error.message
            : "An unknown error occured, please try refreshing the page.."}
        </p>
        <Button
          onClick={() => navigate(0)}
          className="!uppercase drop-shadow-xl w-full"
        >
          {isLoading ? "retrying..." : "try again"}
        </Button>
      </CardContent>
    </Card>
  );
}
