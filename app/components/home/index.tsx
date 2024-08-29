import { Header } from "./header";
import { Courses } from "./courses";
import { Modules } from "./modules";
import { ContentOverview } from "./content-overview";
import { Features } from "./features";
import { Testimonial } from "./testimonial";
import { Partnerships } from "./partnerships";
import { Subscription } from "./subscription";
import { Stripe } from "~/services/stripe.server";
import { MetaCourse, MetaModule } from "~/services/sanity/types";

export function Home({
  plans,
  courses,
  modules,
}: {
  plans: Promise<Stripe.Price[]>;
  courses: Promise<MetaCourse[]>;
  modules: Promise<MetaModule[]>;
}) {
  return (
    <div className="bg-white">
      <Header />
      <Courses courses={courses} />
      <Modules modules={modules} />
      <ContentOverview />
      <Features />
      <Testimonial />
      <Partnerships />
      <Subscription plans={plans} />
    </div>
  );
}
