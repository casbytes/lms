import React from "react";
import { Container } from "../container";
import { Button } from "../ui/button";
import { Fade, Slide } from "react-awesome-reveal";
import { MetaCourse } from "~/services/sanity/types";
import { Await } from "@remix-run/react";
import CourseDialog from "../course-dialog";
import { DialogTrigger } from "../ui/dialog";

export function CoursesOverview({
  courses,
}: {
  courses: Promise<MetaCourse[]>;
}) {
  return (
    <Container className="bg-white mb-8" id="courses">
      <div className="flex flex-col items-center max-w-6xl mx-auto gap-8">
        <Slide direction="right" cascade duration={300}>
          <h1 className="text-3xl text-blue-600 font-bold mb-8">Courses</h1>
          <React.Suspense fallback={<p>Loading...</p>}>
            <Await resolve={courses}>
              {(courses) => (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <Fade cascade damping={0.1} duration={200}>
                      {courses?.length
                        ? courses.map((course) => (
                            <CourseDialog
                              key={course.id}
                              course={course}
                              cardButton={
                                <DialogTrigger asChild>
                                  <Button>Learn more</Button>
                                </DialogTrigger>
                              }
                            />
                          ))
                        : null}
                    </Fade>
                  </div>
                  {!courses?.length ? (
                    <h1 className="text-center text-6xl w-full font-mono mb-8">
                      COMING SOON!
                    </h1>
                  ) : null}
                </>
              )}
            </Await>
          </React.Suspense>
        </Slide>
      </div>
    </Container>
  );
}
