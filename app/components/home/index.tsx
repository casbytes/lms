import { Header } from "./header";
import { CoursesOverview } from "./courses-overview";
import { ContentOverview } from "./content-overview";
import { FeatureOverview } from "./feature-overview";
import { Testimonial } from "./testimonial";
import { Partnerships } from "./partnerships";
import { Subscription } from "./subscription";
import { Stripe } from "~/services/stripe.server";

export function Home({
  plans,
}: {
  plans: Stripe.Response<Stripe.ApiList<Stripe.Price>>;
}) {
  return (
    <div className="bg-white">
      <Header />
      <CoursesOverview />
      <ContentOverview />
      <FeatureOverview />
      <Testimonial />
      <Partnerships />
      <Subscription plans={plans} />
    </div>
  );
}
