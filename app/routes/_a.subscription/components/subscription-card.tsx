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
import type { User } from "~/utils/db.server";

type SubscriptionCardProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plan: Record<string, any>;
  user: User;
};

export function SubscriptionCard({ plan, user }: SubscriptionCardProps) {
  const className = "bg-sky-50 text-sky-600";

  const n = useNavigation();
  const planCode = n.formData?.get("plan");
  const isSubmiting = n.formData?.get("intent") === "subscribe";
  const disabled = user.subscribed || isSubmiting;

  return (
    <Card className="bg-white drop-shadow-lg text-sky-600">
      <CardHeader>
        <CardTitle className="text-xl flex justify-between items-start">
          <Badge className={cn("mr-4 bg-emerald-700")}>
            {plan.name === "annually"
              ? "1 year"
              : plan.name === "biannually"
              ? "6 months"
              : plan.name === "quarterly"
              ? "3 months"
              : "1 month"}
          </Badge>
        </CardTitle>
        <CardDescription>
          <span>Billed {plan.name}.</span>
          <span className="block text-xs text-slate-500">Cancel anytime</span>
          <span
            className={cn(
              "block text-center text-xl my-6 p-2 border rounded-md",
              className
            )}
          >
            <span className="drop-shadow-lg">
              <span>{plan.currency} </span>
              {(plan.amount / 100).toLocaleString()}
              <span className="text-lg">
                /
                {plan.name === "annually"
                  ? "year"
                  : plan.name === "biannually"
                  ? "6 months"
                  : plan.name === "quarterly"
                  ? "3 months"
                  : "month"}
              </span>
            </span>
          </span>
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-end">
        <Form
          method="post"
          action={`/subscription/${plan.plan_code}/checkout`}
          className="block mt-auto"
        >
          <input type="hidden" name="plan" value={plan.plan_code} />
          <Button
            name="intent"
            value="subscribe"
            className="bg-sky-600 hover:bg-sky-500 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            {isSubmiting && planCode === plan.plan_code ? (
              <CgSpinnerTwo className="animate-spin mr-2" />
            ) : null}
            Subscribe
          </Button>
        </Form>
        <Badge
          className={cn(
            "bg-rose-600 block",
            plan.name === "monthly" ? "hidden" : ""
          )}
        >
          {plan.name === "annually"
            ? "30% off"
            : plan.name === "biannually"
            ? "20% off"
            : plan.name === "quarterly"
            ? "10% off"
            : null}
        </Badge>
      </CardFooter>
    </Card>
  );
}
