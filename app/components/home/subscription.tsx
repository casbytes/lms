import { Container } from "~/components/container";
import { Button } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";
import { Stripe } from "~/services/stripe.server";
import { aA } from "vitest/dist/reporters-yx5ZTtEV.js";

export function Subscription({
  plans,
}: {
  plans: Stripe.Response<Stripe.ApiList<Stripe.Price>>;
}) {
  return (
    <Container id="subscription">
      <div className="bg-[url('https://cdn.casbytes.com/assets/icon.png')] bg-no-repeat bg-cover bg-opacity-30">
        <div className="mx-auto bg-sky-200/95 rounded-md py-20 px-12">
          <div className="max-w-3xl md:py-12 mx-auto">
            <h1 className="text-center text-2xl mb-16">
              The first module for each course is free. When you are prepared
              and ready to move forward, it's just a step away.
              <p className="text-zinc-600 text-sm">Cancel anytime</p>
            </h1>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 items-center justify-evenly rounded-md mb-14">
                {plans.data
                  .sort((a, b) => a.unit_amount! - b.unit_amount!)
                  .map((plan, index) => (
                    <div key={`item-${index}`}>
                      <h1 className="text-2xl capitalize opacity-60 mb-2">
                        {plan.nickname}
                      </h1>
                      <h2 className="font-bold text-2xl">
                        ${" "}
                        <span className="text-5xl text-slate-600">
                          {plan.unit_amount! / 100}
                        </span>
                      </h2>
                      <p className="font-bold text-sm">
                        for{" "}
                        {plan.nickname === "Annually"
                          ? "1 year"
                          : plan.nickname === "Biannually"
                          ? "6 months"
                          : plan.nickname === "Quarterly"
                          ? "3 months"
                          : "1 month"}
                      </p>
                    </div>
                  ))}
              </div>
              <DialogTrigger>Get started</DialogTrigger>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

const paymentOptions = [
  { season: "month", price: 14.9 },
  { season: "quarter", price: 40.9 },
  { season: "biannual", price: 74.9 },
  { season: "year", price: 143.9 },
];
