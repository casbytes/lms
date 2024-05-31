import { useNavigation, useSubmit } from "@remix-run/react";
import React from "react";
import { FaSpinner } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import { LuCircleDotDashed } from "react-icons/lu";
import { SlLock } from "react-icons/sl";
import { Button } from "~/components/ui/button";
import { ILesson, ILessonProgress, Status } from "~/constants/types";
import { capitalizeFirstLetter } from "~/utils/cs";

type LessonProps = {
  lesson: ILessonProgress;
};

export function Lesson({ lesson }: LessonProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === "some";

  const completed = lesson.status === Status.COMPLETED;
  const inProgress = lesson.status === Status.IN_PROGRESS;
  const locked = lesson.status === Status.LOCKED;

  const index = 2;
  return (
    <li className="w-full">
      <Button
        onClick={() =>
          submit({
            lessonSlug: lesson.slug,
          })
        }
        disabled={locked}
        variant="secondary"
        className="flex items-center justify-start bg-slate-300 hover:bg-slate-300/50 text-black w-full"
      >
        <>
          {isLoading ? (
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
