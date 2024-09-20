import { Header } from "./header";
import { Courses } from "./courses";
import { Modules } from "./modules";
import { Overview } from "./overview";
import { Features } from "./features";
import { Testimonial } from "./testimonial";
import { Partnerships } from "./partnerships";
import { Subscription } from "./subscription";
import { MetaCourse, MetaModule } from "~/services/sanity/types";

export function Home({
  plans,
  courses,
  modules,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plans: Promise<Record<string, any>>;
  courses: Promise<MetaCourse[]>;
  modules: Promise<MetaModule[]>;
}) {
  return (
    <div className="bg-white">
      <Header />
      <Features />
      <Courses courses={courses} />
      <Modules modules={modules} />
      <Overview />
      <Testimonial />
      <Partnerships />
      <Subscription plans={plans} />
    </div>
  );
}
