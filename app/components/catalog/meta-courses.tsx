import React from "react";
import { MetaCourse } from "~/services/sanity/types";
import { Await } from "@remix-run/react";
import { Fade } from "react-awesome-reveal";
import { DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { CatalogDialog } from "./catalog-dialog";

export function MetaCourses({ courses }: { courses: Promise<MetaCourse[]> }) {
  return (
    <React.Suspense fallback={<p>Loading...</p>}>
      <Await resolve={courses}>
        {(courses) => (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Fade cascade damping={0.1} duration={200}>
                {courses?.length
                  ? courses.map((course, index) => (
                      <CatalogDialog
                        key={`${course.id}-${index}`}
                        course={course}
                        dialogActionButton={<Button>Add to catalog</Button>}
                        cardActionButton={
                          <DialogTrigger asChild>
                            <Button variant={"outline"} size={"sm"}>
                              Learn more
                            </Button>
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
  );
}
