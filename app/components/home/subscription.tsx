/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Container } from "~/components/container";
import { DialogTrigger } from "../ui/dialog";
import { Await } from "@remix-run/react";
import { Button } from "../ui/button";

export function Subscription({
  plans,
}: {
  plans: Promise<Record<string, any>>;
}) {
  return (
    <Container id="subscription">
      <div className="bg-[url('https://cdn.casbytes.com/assets/icon.png')] bg-no-repeat bg-cover bg-opacity-30">
        <div className="mx-auto bg-sky-200/95 rounded-md py-20 px-12">
          <div className="max-w-4xl md:py-12 mx-auto">
            <h1 className="text-center max-w-xl mx-auto text-2xl mb-16">
              Our free modules offer a taste of what&apos;s to come. Subscribe
              to gain unlimited access to our comprehensive curriculum.
              <span className="text-zinc-600 text-sm block">
                Cancel anytime
              </span>
            </h1>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 items-center justify-between rounded-md mb-14">
                <React.Suspense fallback={<p>Loading...</p>}>
                  <Await resolve={plans}>
                    {(plans) => (
                      <>
                        {plans?.length &&
                          plans.map(
                            (plan: Record<string, any>, index: number) => (
                              <div key={`item-${index}`}>
                                <h1 className="text-xl capitalize opacity-60 mb-2">
                                  {plan.name}
                                </h1>
                                <h2 className="font-bold text-xl">
                                  {plan.currency}{" "}
                                  <span className="text-5xl text-slate-600">
                                    {(plan.amount! / 100).toLocaleString()}
                                  </span>
                                </h2>
                                <p className="font-bold text-sm">
                                  for{" "}
                                  {plan.name === "annually"
                                    ? "1 year"
                                    : plan.name === "biannually"
                                    ? "6 months"
                                    : plan.name === "quarterly"
                                    ? "3 months"
                                    : "1 month"}
                                </p>
                              </div>
                            )
                          )}
                      </>
                    )}
                  </Await>
                </React.Suspense>
              </div>
              <DialogTrigger asChild>
                <Button>Get started</Button>
              </DialogTrigger>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
