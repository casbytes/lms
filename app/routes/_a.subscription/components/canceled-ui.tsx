import { Link } from "@remix-run/react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { FcCancel } from "react-icons/fc";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { StatusAction } from "../route";

export function CheckoutCancelUI({
  dispatch,
}: {
  dispatch: (action: StatusAction) => void;
}) {
  return (
    <Card className="max-w-lg mx-auto mt-8 md:mt-12 bg-red-50">
      <CardHeader>
        <FcCancel size={80} className="mx-auto mb-4" />
        <CardDescription className="mx-auto">
          <span className="block text-4xl font-bold text-center text-red-600">
            Canceled!
          </span>
          <span className="block text-lg text-center max-w-sm mt-6">
            Your subscription has been canceled. You can still access all the
            free modules.
          </span>
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-around mt-8">
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
      </CardFooter>
    </Card>
  );
}
