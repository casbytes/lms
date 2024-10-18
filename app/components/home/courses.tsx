import { Container } from "../container";
import { Slide } from "react-awesome-reveal";
import { MetaCourse } from "~/services/sanity/types";
import { MetaCourses } from "../catalog/meta-courses";

export function Courses({ courses }: { courses: Promise<MetaCourse[]> }) {
  return (
    <Container className="bg-white my-8" id="courses">
      <div className="flex flex-col items-center max-w-6xl mx-auto gap-8">
        <Slide direction="right" cascade duration={300}>
          <h1 className="text-3xl text-blue-600 font-bold mb-8">Courses</h1>
          <MetaCourses courses={courses} user={null} currentItem={null} />
        </Slide>
      </div>
    </Container>
  );
}
