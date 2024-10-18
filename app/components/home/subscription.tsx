import React from "react";
import { Container } from "~/components/container";
import { Await } from "@remix-run/react";
import { Button } from "../ui/button";
import { useAuthDialog } from "~/contexts/auth-dialog-context";
import { SubscriptionTabs } from "../subscription";
import { Stripe } from "~/services/stripe.server";
import { FaArrowRightLong } from "react-icons/fa6";

export function Subscription({
  plans,
}: {
  plans: Promise<Stripe.Response<Stripe.ApiList<Stripe.Plan>>>;
}) {
  const { openAuthDialog } = useAuthDialog();
  return (
    <Container id="subscription">
      <div className="bg-[url('https://cdn.casbytes.com/assets/icon.png')] bg-no-repeat bg-cover bg-opacity-30">
        <div className="mx-auto bg-sky-200/95 rounded-md pb-20 px-12">
          <div className="max-w-4xl md:py-12 mx-auto">
            <h1 className="text-center max-w-xl mx-auto text-2xl mb-16">
              Our free modules offer a taste of what&apos;s to come. Subscribe
              to gain unlimited access to our comprehensive curriculum.
              <span className="text-zinc-600 text-sm block">
                Cancel anytime
              </span>
            </h1>
            <div className="flex flex-col gap-6">
              <React.Suspense fallback={<p>Loading...</p>}>
                <Await resolve={plans}>
                  {(plans) => <SubscriptionTabs plans={plans} user={null} />}
                </Await>
              </React.Suspense>
            </div>
            <Button className="mt-12 text-lg mx-auto w-full flex items-center justify-center gap-4" onClick={openAuthDialog}>
              Get started <FaArrowRightLong size={20} />
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
