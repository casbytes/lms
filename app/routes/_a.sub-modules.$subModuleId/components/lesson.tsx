import { useNavigation, useSearchParams } from "@remix-run/react";
import type { Lesson } from "~/utils/db.server";
import { FaSpinner } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import { LuCircleDotDashed } from "react-icons/lu";
import { SlLock } from "react-icons/sl";
import { Button } from "~/components/ui/button";
import { SheetClose } from "~/components/ui/sheet";
import { cn } from "~/libs/shadcn";
import { capitalizeFirstLetter, STATUS } from "~/utils/helpers";

type LessonProps = {
  lesson: Lesson;
};

export function Lesson({ lesson }: LessonProps) {
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonId = navigation.formData?.get("lessonId");
  const currentLessonId = searchParams.get("lessonId");

  const COMPLETED = lesson.status === STATUS.COMPLETED;
  const IN_PROGRESS = lesson.status === STATUS.IN_PROGRESS;
  const LOCKED = lesson.status === STATUS.LOCKED;

  const disabled = lessonId === lesson.id || LOCKED;

  return (
    <li className="w-full">
      <SheetClose asChild>
        <Button
          variant="secondary"
          onClick={() => {
            setSearchParams((params) => {
              params.set("lessonId", lesson.id);
              return params;
            });
          }}
          disabled={disabled}
          className={cn(
            "flex items-center justify-start bg-slate-300/50 hover:bg-slate-300 text-black w-full",
            {
              "border-2 border-sky-700 text-sky-800 bg-slate-200":
                currentLessonId === lesson.id,
            }
          )}
        >
          <>
            {lessonId === lesson.id ? (
              <FaSpinner size={20} className="mr-4 text-sky-600 animate-spin" />
            ) : COMPLETED ? (
              <FiCheckCircle size={20} className="mr-4 text-blue-600" />
            ) : IN_PROGRESS ? (
              <LuCircleDotDashed size={20} className="mr-4 text-blue-600" />
            ) : (
              <SlLock size={20} className="mr-4" />
            )}{" "}
            {capitalizeFirstLetter(lesson.title)}
          </>
        </Button>
      </SheetClose>
    </li>
  );
}
