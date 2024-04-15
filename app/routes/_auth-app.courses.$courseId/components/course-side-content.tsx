import { CourseTitle } from "~/components/course-title";
import { Courses } from "./courses";
import { Status } from "~/components/status";
import { TrophyCarbinet } from "./trophy-carbinet";

export function CourseSideContent() {
  return (
    <>
      <CourseTitle title="Trophy cabinet" />

      <TrophyCarbinet />
      <CourseTitle title="Modules" />
      <div className="flex flex-col gap-8">
        <Status />
        <Courses />
      </div>
    </>
  );
}
