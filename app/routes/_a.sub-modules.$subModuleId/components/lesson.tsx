import { useNavigation, useSearchParams, useSubmit } from "@remix-run/react";
import { FaSpinner } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import { LuCircleDotDashed } from "react-icons/lu";
import { SlLock } from "react-icons/sl";
import { Button } from "~/components/ui/button";
import { ILessonProgress, Status } from "~/constants/types";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter } from "~/utils/cs";

type LessonProps = {
  lesson: ILessonProgress;
};

export function Lesson({ lesson }: LessonProps) {
  const [searchParams] = useSearchParams();

  const submit = useSubmit();
  const navigation = useNavigation();

  const lessonSlug = navigation.formData?.get("lessonSlug");
  const currentLessonSlug = searchParams.get("lessonSlug");

  const completed = lesson.status === Status.COMPLETED;
  const inProgress = lesson.status === Status.IN_PROGRESS;
  const locked = lesson.status === Status.LOCKED;

  return (
    <li className="w-full">
      <Button
        variant="secondary"
        onClick={() => submit({ lessonSlug: lesson.slug })}
        disabled={locked || lessonSlug === lesson.slug}
        className={cn(
          "flex items-center justify-start bg-slate-300/50 hover:bg-slate-300 text-black w-full",
          {
            "border-2 border-sky-700 text-sky-800 bg-slate-200":
              currentLessonSlug === lesson.slug,
          }
        )}
      >
        <>
          {lessonSlug === lesson.slug ? (
            <FaSpinner size={20} className="mr-4 text-sky-600 animate-spin" />
          ) : completed ? (
            <FiCheckCircle size={20} className="mr-4 text-blue-600" />
          ) : inProgress ? (
            <LuCircleDotDashed size={20} className="mr-4 text-blue-600" />
          ) : (
            <SlLock size={20} className="mr-4" />
          )}{" "}
          {capitalizeFirstLetter(lesson.title)}
        </>
      </Button>
    </li>
  );
}
