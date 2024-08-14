import { Form, Link, useNavigation } from "@remix-run/react";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaAngleLeft, FaAngleRight, FaRegCreditCard } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { StatusAction } from "../route";

export function CheckoutSuccessUI({
  dispatch,
}: {
  dispatch: (action: StatusAction) => void;
}) {
  const n = useNavigation();
  const isSubmiting = n.formData?.get("intent") === "manage";

  return (
    <Card className="max-w-lg mx-auto mt-8 md:mt-12 bg-blue-50">
      <CardHeader>
        <FiCheckCircle size={80} className="text-blue-600 mx-auto mb-4" />
        <CardDescription className="mx-auto">
          <h1 className="text-4xl font-bold text-center text-blue-600">
            Success!
          </h1>
          <p className="text-lg text-center max-w-sm mt-6">
            You have successfully subscribed to our annual plan. You can now
            access all our courses.
          </p>
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col gap-4 mt-4">
        <Form method="post" action="/stripe/portal/session">
          <Button name="intent" value="manage" type="submit" variant="outline">
            {isSubmiting ? (
              <CgSpinnerTwo className="animate-spin mr-2" />
            ) : (
              <FaRegCreditCard className="mr-2" size={25} />
            )}{" "}
            Manage your billing information
          </Button>
        </Form>
        <div className="flex gap-4">
          <Button onClick={() => dispatch({ type: "RESET" })} asChild>
            <Link to="/subscription">
              <FaAngleLeft className="mr-4" />
              Subscription
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard">
              Dashboard <FaAngleRight className="ml-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
