import { Stripe } from "~/services/stripe.server";
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
import { FaRegCreditCard } from "react-icons/fa6";
import type { User } from "~/utils/db.server";

type SubscriptionCardProps = {
  plan: Stripe.Price;
  user: User;
  subs: Stripe.Response<Stripe.ApiList<Stripe.Subscription>>;
};

export function SubscriptionCard({ plan, user, subs }: SubscriptionCardProps) {
  const className = "bg-sky-50 text-sky-600";

  const n = useNavigation();
  const planId = n.formData?.get("planId");
  const isSubmiting = n.formData?.get("intent") === "subscribe";

  const disabled = user.subscribed || isSubmiting;
  const activePlanId = subs?.data[0]?.items?.data[0]?.plan?.id;
  const activePlan = user.subscribed && activePlanId === plan.id;

  return (
    <Card className="bg-white drop-shadow-lg text-sky-600">
      <CardHeader>
        <CardTitle className="text-xl flex justify-between items-start">
          <Badge className={cn("mr-4 bg-emerald-700 text-lg")}>
            {plan.nickname === "Annually"
              ? "1 year"
              : plan.nickname === "Biannually"
              ? "6 months"
              : plan.nickname === "Quarterly"
              ? "3 months"
              : "1 month"}
          </Badge>
          <Badge
            className={cn(
              "mr-4 bg-rose-600",
              plan.nickname === "Monthly" ? "hidden" : ""
            )}
          >
            {plan.nickname === "Annually"
              ? "30% off"
              : plan.nickname === "Biannually"
              ? "20% off"
              : plan.nickname === "Quarterly"
              ? "10% off"
              : null}
          </Badge>
        </CardTitle>
        <CardDescription className="text-lg">
          <span className={className}>Billed {plan.nickname}.</span>
          <span className="block text-sm text-slate-500">Cancel anytime</span>
          <span
            className={cn(
              "block text-center text-6xl my-6 p-2 border rounded-md",
              className
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
              className="bg-sky-600 hover:bg-sky-500 disabled:cursor-not-allowed"
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
