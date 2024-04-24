import { useFetcher, useNavigation } from "@remix-run/react";
import { FaPlus, FaSpinner } from "react-icons/fa6";
import { capitalizeFirstLetter } from "~/utils/cs";
import { ICourse } from "~/constants/types";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";

export function CoursesCard({
  data,
}: {
  data: { courses: ICourse[]; inCatalog: boolean };
}) {
  const { inCatalog, courses } = data;
  const fetcher = useFetcher();
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === "addCourseToCatalog";

  return (
    <div>
      <h1 className="text-xl mb-4">Courses</h1>
      <Input
        placeholder="search courses"
        type="search"
        id="search"
        name="search"
        className="mb-4"
      />
      <div className="rounded-md bg-indigo-300/30 p-6 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-indigo-600">Courses</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Title</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-slate-600 font-black">
            {courses && courses?.length > 0 ? (
              courses.map((course, index) => (
                <TableRow key={`${course.title}-${index}`}>
                  <TableCell className="text-lg">
                    {capitalizeFirstLetter(course.title)}
                  </TableCell>
                  <TableCell className="flex gap-6 items-center justify-end">
                    <Button
                      className="bg-indigo-500 hover:bg-indigo-400 py-1 font-black"
                      size="sm"
                      disabled={inCatalog || isLoading}
                      onClick={() => {
                        fetcher.submit(
                          { intent: "addCourseToCatalog", courseId: course.id },
                          { method: "POST" }
                        );
                      }}
                    >
                      <FaPlus className="mr-2" />
                      {isLoading ? (
                        <FaSpinner className="mr-2 animate-spin" />
                      ) : null}
                      Add to catalog
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2}>No courses available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
