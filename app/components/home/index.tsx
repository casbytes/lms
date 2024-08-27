import { Header } from "./header";
import { CoursesOverview } from "./courses-overview";
import { ContentOverview } from "./content-overview";
import { FeatureOverview } from "./feature-overview";
import { Testimonial } from "./testimonial";
import { Partnerships } from "./partnerships";
import { Subscription } from "./subscription";
import { Stripe } from "~/services/stripe.server";
import { ModulesOverview } from "./modules-overview";
import { MetaCourse, MetaModule } from "~/services/sanity/types";

export function Home({
  plans,
  courses,
  modules,
}: {
  plans: Stripe.Price[];
  courses: MetaCourse[];
  modules: MetaModule[];
}) {
  return (
    <div className="bg-white">
      <Header />
      <CoursesOverview courses={courses} />
      <ModulesOverview modules={modules} />
      <ContentOverview />
      <FeatureOverview />
      <Testimonial />
      <Partnerships />
      <Subscription plans={plans} />
    </div>
  );
}
