import { Form, useNavigation } from "@remix-run/react";
import { format } from "date-fns";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaRegCreditCard } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import { MdOutlineCreditCardOff } from "react-icons/md";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { safeParseDate } from "~/utils/helpers";

export function ActiveSubCard({
  activeSubscription,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeSubscription: Record<string, any>;
}) {
  const n = useNavigation();

  const isUpdate = n.formData?.get("intent") === "update";
  const isCancel = n.formData?.get("intent") === "cancel";
  const disabled = isUpdate || isCancel;
  return (
    <Card className="mt-8 max-w-3xl mx-auto">
      <CardHeader>
        <FiCheckCircle className="mx-auto block text-sky-600 mb-8" size={55} />
        <CardTitle className="text-xl text-center font-mono">
          {activeSubscription.plan.description}
        </CardTitle>
        <CardDescription className="text-center text-3xl">
          <Badge className="inline-block mx-auto text-xl">
            {activeSubscription.plan.currency}{" "}
            {(activeSubscription.plan.amount / 100).toLocaleString()}
          </Badge>
          <br />
          <span className="!text-lg">
            Renewal date:{" "}
            {format(
              safeParseDate(activeSubscription.next_payment_date),
              "dd MMMM, yyyy"
            )}
          </span>
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col gap-4 mt-4">
        <Form method="post" className="flex flex-col gap-4">
          <input
            type="hidden"
            name="code"
            value={activeSubscription.subscription_code}
          />
          <Button
            name="intent"
            value="update"
            type="submit"
            variant="outline"
            disabled={disabled}
          >
            {isUpdate ? (
              <CgSpinnerTwo className="animate-spin mr-2" size={25} />
            ) : (
              <FaRegCreditCard className="mr-2" size={25} />
            )}{" "}
            Update billing information
          </Button>
          <Button
            name="intent"
            value="cancel"
            type="submit"
            variant="destructive"
            disabled={disabled}
          >
            {isCancel ? (
              <CgSpinnerTwo className="animate-spin mr-2" size={25} />
            ) : (
              <MdOutlineCreditCardOff className="mr-2" size={25} />
            )}{" "}
            Cancel subscription
          </Button>
        </Form>
      </CardFooter>
    </Card>
  );
}
