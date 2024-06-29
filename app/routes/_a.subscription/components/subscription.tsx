import React from "react";
import { SubscriptionCard } from "./subscription-card";
import Stripe from "stripe";
import { Form, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaRegCreditCard } from "react-icons/fa6";
import { IUser } from "~/constants/types";
import { MdOutlineCreditCardOff } from "react-icons/md";

export function Subscription({
  plans,
  user,
  subs,
}: {
  user: IUser;
  plans: Stripe.Response<Stripe.ApiList<Stripe.Price>>;
  subs: Stripe.Response<Stripe.ApiList<Stripe.Subscription>>;
}) {
  const n = useNavigation();
  const isManage = n.formData?.get("intent") === "mybi";
  const isCancel = n.formData?.get("intent") === "cancel";

  const disabled = !user.subscribed || isManage || isCancel;

  return (
    <div className="w-full">
      {user.subscribed ? (
        <Form
          method="post"
          action="/stripe/portal/session"
          className="my-6 flex gap-6"
        >
          <Button
            name="intent"
            value="mybi"
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
        {plans.data.map((plan) => (
          <SubscriptionCard plan={plan} user={user} subs={subs} key={plan.id} />
        ))}
      </div>
    </div>
  );
}
