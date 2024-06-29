import Stripe from "stripe";
import { Form, useNavigation } from "@remix-run/react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/libs/shadcn";
import { CgSpinnerTwo } from "react-icons/cg";
import { IUser } from "~/constants/types";
import { FaRegCreditCard } from "react-icons/fa6";

type SubscriptionCardProps = {
  plan: Stripe.Price;
  user: IUser;
  subs: Stripe.Response<Stripe.ApiList<Stripe.Subscription>>;
};

export function SubscriptionCard({ plan, user, subs }: SubscriptionCardProps) {
  const classNames: Record<string, string> = {
    standard_monthly: "bg-blue-100/50 text-blue-700",
    standard_quarterly: "bg-green-100/50 text-green-600",
    standard_biannually: "bg-yellow-100/50 text-yellow-600",
    standard_annually: "bg-red-100/50 text-red-600",
  };

  const n = useNavigation();
  const planId = n.formData?.get("planId");
  const isSubmiting = n.formData?.get("intent") === "subscribe";

  const disabled = user.subscribed || isSubmiting;
  const activePlanId = subs.data[0].items.data[0].plan.id;
  const activePlan = user.subscribed && activePlanId === plan.id;

  return (
    <Card className={classNames[plan.lookup_key!]}>
      <CardHeader>
        <CardTitle className="text-xl">
          <Badge className="mr-4">
            {plan.nickname === "Annually"
              ? " 1 year"
              : plan.nickname === "Biannually"
              ? "6 months"
              : plan.nickname === "Quarterly"
              ? "3 months"
              : "1 month"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-lg">
          Billed {plan.nickname}.
          <span className="block text-sm text-slate-500">Cancel anytime</span>
          <span
            className={cn(
              "block text-center text-6xl my-6 p-2 border rounded-md",
              classNames[plan.lookup_key!]
            )}
          >
            <span className="drop-shadow-lg">
              <span className="text-2xl">$</span>
              {plan.unit_amount! / 100}
              <span className="text-lg">
                /
                {plan.nickname === "Annually"
                  ? "year"
                  : plan.nickname === "Biannually"
                  ? "6 months"
                  : plan.nickname === "Quarterly"
                  ? "3 months"
                  : "month"}
              </span>
            </span>
          </span>
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Form
          method="post"
          action={`/stripe/${plan.id}/checkout`}
          className="flex items-end gap-4 justify-end w-full"
        >
          <input type="hidden" name="planId" value={plan.id} />
          {user.subscribed && activePlanId !== plan.id ? null : (
            <Button
              name="intent"
              value="subscribe"
              className={cn(activePlan ? "bg-sky-600 " : "")}
              disabled={disabled}
            >
              {isSubmiting && planId === plan.id ? (
                <CgSpinnerTwo className="animate-spin mr-2" />
              ) : null}
              {activePlan ? (
                <>
                  <FaRegCreditCard className="mr-2" size={25} />
                  Active plan
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          )}
        </Form>
      </CardFooter>
    </Card>
  );
}
