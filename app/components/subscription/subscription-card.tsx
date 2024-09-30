import { cn } from "~/libs/shadcn";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { User } from "~/utils/db.server";
import { Form, useNavigation } from "@remix-run/react";
import { CgSpinnerTwo } from "react-icons/cg";
import { IoCheckmarkDone } from "react-icons/io5";
import { Stripe } from "~/services/stripe.server";

export function SubscriptionCard({
  plan,
  user,
}: {
  plan: Stripe.Plan;
  user: User | null;
}) {
  const n = useNavigation();
  const planId = n.formData?.get("planId");
  const isSubmiting = n.formData?.get("intent") === "subscribe";
  const disabled = user?.subscribed || isSubmiting;
  const subscriptionFeatures = [
    "Cancel anytime",
    "Access to all future updates",
    "24/7 mentors and trainers support",
    "Access to CASBytes Discord community",
    "Unlimited access to all courses and modules",
    "Access to all tests, checkpoints, and projects",
    "Certificate of completion for each course and module",
    "Internship opportunities for course completion top performers",
  ];
  return (
    <Card className="w-full md:w-[80%] lg:w-[60%] mx-auto bg-sky-50/90 border border-sky-500">
      <CardHeader className="mb-4">
        <CardTitle className="capitalize mb-4 text-xl font-mono text-sky-800">
          {plan.nickname}{" "}
        </CardTitle>
        <CardDescription>
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="text-lg">
                Billed {plan.nickname?.split(" ")[0]}
                {plan.nickname === "monthly plan" ||
                plan.nickname === "quarterly plan"
                  ? ""
                  : "ly"}
              </div>
              <Separator className="bg-sky-600" />

              <div className="text-5xl flex items-start">
                {" "}
                <span className="text-lg font-mono">$</span>
                {plan.amount! / 100}
                <sub className="self-end text-sm">
                  {" "}
                  /
                  {plan.nickname === "annual plan"
                    ? "year"
                    : plan.nickname === "biannual plan"
                    ? "6 months"
                    : plan.nickname === "quarterly plan"
                    ? "3 months"
                    : "month"}
                </sub>
              </div>
              <Separator className="bg-sky-600" />
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {subscriptionFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <IoCheckmarkDone className="" />
              <span className="text-sky-800">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full items-center">
          <Badge
            className={cn(
              "bg-rose-500 block",
              plan.nickname === "monthly plan" ? "hidden" : ""
            )}
          >
            {plan.nickname === "annual plan"
              ? "SAVE 15%"
              : plan.nickname === "biannual plan"
              ? "SAVE 10%"
              : plan.nickname === "quarterly plan"
              ? "SAVE 5%"
              : null}
          </Badge>
          {user ? (
            <Form
              method="post"
              action={`/subscription/session/checkout`}
              className="block mt-auto"
            >
              <input type="hidden" name="planId" value={plan.id} />
              <Button
                name="intent"
                value="subscribe"
                className="bg-sky-600 hover:bg-sky-500 disabled:cursor-not-allowed"
                disabled={disabled}
              >
                {isSubmiting && planId === plan.id ? (
                  <CgSpinnerTwo className="animate-spin mr-2" />
                ) : null}
                SUBSCRIBE
              </Button>
            </Form>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
