import { Header } from "./header";
import { CoursesOverview } from "./courses-overview";
import { ContentOverview } from "./content-overview";
import { CurriculumOverview } from "./curriculum-overview";
import { Testimonial } from "./testimonial";
import { Partnerships } from "./partnerships";
import { Subscription } from "./subscription";

export function Home() {
  return (
    <div className="bg-white">
      <Header />
      <CoursesOverview />
      <ContentOverview />
      <CurriculumOverview />
      <Testimonial />
      <Partnerships />
      <Subscription />
    </div>
  );
}
