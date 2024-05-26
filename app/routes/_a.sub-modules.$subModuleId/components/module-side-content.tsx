import { useNavigation, useSubmit } from "@remix-run/react";
import { SlLock } from "react-icons/sl";
import { FiCheckCircle } from "react-icons/fi";
import { CourseTitle } from "~/components/course-title";
import { Status } from "~/components/status";
import { Button } from "~/components/ui/button";
import { FaSpinner } from "react-icons/fa6";
import { capitalizeFirstLetter } from "~/utils/cs";

export function ModuleSideContent({ lessons }: any) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === "some";

  return (
    <>
      <CourseTitle title="Functions" />
      <Status status={lessons} />
      <ul className="grid grid-cols-1 gap-4 p-2">
        {lessons && lessons?.length > 0 ? (
          lessons.map((lesson: any, index: number) => (
            <li key={`${lesson.id}-${index}`} className="w-full">
              <Button
                onClick={() =>
                  submit({
                    lessonSlug: lesson.slug,
                  })
                }
                disabled={index > 1}
                variant="secondary"
                className="flex items-center justify-start bg-slate-300 hover:bg-slate-300/50 text-black w-full"
              >
                <>
                  {isLoading ? (
                    <FaSpinner
                      size={20}
                      className="mr-4 text-sky-600 animate-spin"
                    />
                  ) : index < 2 ? (
                    <FiCheckCircle size={20} className="mr-4 text-blue-600" />
                  ) : (
                    <SlLock size={20} className="mr-4" />
                  )}{" "}
                  {capitalizeFirstLetter(lesson.title)}
                </>
              </Button>
            </li>
          ))
        ) : (
          <p>There are no lessons in this sub module</p>
        )}
      </ul>
    </>
  );
}
