import { User } from "~/utils/db.server";
import { Stripe } from "~/services/stripe.server";
import { SubscriptionCard } from "./subscription-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function SubscriptionTabs({
  user,
  plans,
  className,
}: {
  user: User | null;
  plans: Stripe.Response<Stripe.ApiList<Stripe.Plan>>;
  className?: string;
}) {
  return (
    <div className={className}>
      <Tabs
        defaultValue={plans?.data?.[0].nickname || "annual plan"}
        className="w-full mx-auto block"
      >
        <TabsList className="w-full md:w-[80%] mx-auto flex justify-evenly border-2 border-slate-50 bg-inherit mb-12">
          {plans.data?.length &&
            plans.data.map((plan: Stripe.Plan, index: number) => (
              <TabsTrigger
                value={plan.nickname!}
                key={`item-${index}`}
                className="p-2 text-lg capitalize text-slate-800"
              >
                {plan.nickname}
              </TabsTrigger>
            ))}
        </TabsList>

        {plans.data?.length &&
          plans.data.map((plan: Stripe.Plan) => (
            <TabsContent value={plan.nickname!} key={`content-${plan.id}`}>
              <SubscriptionCard plan={plan} user={user} />
            </TabsContent>
          ))}
      </Tabs>
    </div>
  );
}
