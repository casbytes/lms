import { ICourseProgress } from "~/constants/types";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { Course } from "./course";

type CCCProps = {
  userCourses: ICourseProgress[];
};

export function Courses({ userCourses }: CCCProps) {
  return (
    <div className="rounded-md bg-teal-300/30 p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-teal-600">Course catalog</h2>
      <Table>
        <TableBody className="text-slate-600 text-lg">
          {userCourses && userCourses?.length ? (
            userCourses.map((course, index) => (
              <Course course={course} key={`${course.id}-${index}`} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>
                No courses in your catalog.
                <br />
                <span className="text-sm">
                  Add a course to your catalog to begin your journey.
                </span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
