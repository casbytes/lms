import type { User } from "~/utils/db.server";
import { Stripe } from "~/services/stripe.server";
import { SubscriptionCard } from "./subscription-card";
import { Form, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaRegCreditCard } from "react-icons/fa6";
import { MdOutlineCreditCardOff } from "react-icons/md";

type SubscriptionProps = {
  user: User;
  plans: Stripe.Price[];
  subs: Stripe.Subscription[];
};

export function Subscription({ plans, user, subs }: SubscriptionProps) {
  const n = useNavigation();
  const isManage = n.formData?.get("intent") === "manage";
  const isCancel = n.formData?.get("intent") === "cancel";
  const disabled = !user.subscribed || isManage || isCancel;

  return (
    <div className="w-full">
      {user.subscribed ? (
        <Form
          method="post"
          action="/stripe/portal/session"
          className="my-6 flex flex-wrap gap-6"
        >
          <Button
            name="intent"
            value="manage"
            type="submit"
            className="disabled:cursor-not-allowed"
            disabled={disabled}
          >
            {isManage ? (
              <CgSpinnerTwo className="animate-spin mr-2" />
            ) : (
              <FaRegCreditCard className="mr-2" size={25} />
            )}{" "}
            Manage your billing information
          </Button>
          <Button
            name="intent"
            value="cancel"
            type="submit"
            variant="destructive"
            className="disabled:cursor-not-allowed"
            disabled={disabled}
          >
            {isCancel ? (
              <CgSpinnerTwo className="animate-spin mr-2" />
            ) : (
              <MdOutlineCreditCardOff className="mr-2" size={25} />
            )}{" "}
            Cancel subscription
          </Button>
        </Form>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {plans.map((plan) => (
          <SubscriptionCard plan={plan} user={user} subs={subs} key={plan.id} />
        ))}
      </div>
    </div>
  );
}
