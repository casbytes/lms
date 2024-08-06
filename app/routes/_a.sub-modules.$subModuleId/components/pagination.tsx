import { useNavigate, useSearchParams, useFetcher } from "@remix-run/react";
import type { Lesson, Module, SubModule } from "~/utils/db.server";
import { FaSpinner } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { Button } from "~/components/ui/button";
import { STATUS } from "~/utils/helpers";

type LessonWithModule = Lesson & {
  subModule: SubModule & {
    module: Module;
  };
};

type PaginationProps = {
  currentLessonData: {
    previousLesson: LessonWithModule | null;
    currentLesson: LessonWithModule;
    nextLesson: LessonWithModule | null;
  };
};

export function Pagination({ currentLessonData }: PaginationProps) {
  const f = useFetcher();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const lessonId = f.formData?.get("lessonId");
  const { previousLesson, currentLesson, nextLesson } = currentLessonData;
  const moduleTitle = currentLesson.subModule?.module?.title;
  const redirectUrl = `/courses/${currentLesson?.subModule?.module?.courseId}?moduleId=${currentLesson?.subModule?.moduleId}`;

  function handleSetSearchParams(lessonId: string) {
    setSearchParams((params) => {
      params.set("lessonId", lessonId);
      return params;
    });
  }

  function submit(lessonId: string) {
    f.submit({ lessonId }, { method: "post" });
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row justify-between">
      {previousLesson ? (
        <Button
          onClick={() => handleSetSearchParams(previousLesson.id)}
          variant="outline"
          aria-label={previousLesson.title}
          className="flex items-center"
          disabled={lessonId === previousLesson.id}
        >
          <>
            {lessonId === previousLesson.id ? (
              <FaSpinner size={20} className="mr-4 text-sky-600 animate-spin" />
            ) : (
              <RiArrowLeftSLine size={20} className="inline h-6 w-6" />
            )}
            {previousLesson.title}
          </>
        </Button>
      ) : (
        <Button
          onClick={() => navigate(redirectUrl)}
          variant="outline"
          aria-label={moduleTitle}
          className="flex items-center"
        >
          <>
            <RiArrowLeftSLine size={20} className="inline h-6 w-6" />
            {moduleTitle}{" "}
          </>
        </Button>
      )}

      {nextLesson ? (
        <Button
          onClick={() => {
            submit(currentLesson.id);
            handleSetSearchParams(nextLesson.id);
          }}
          variant="outline"
          aria-label={nextLesson.title}
          className="flex items-center"
          disabled={lessonId === nextLesson.id}
        >
          <>
            {nextLesson.title}{" "}
            {lessonId === nextLesson.id ? (
              <FaSpinner size={20} className="ml-4 text-sky-600 animate-spin" />
            ) : (
              <RiArrowRightSLine size={20} className="inline h-6 w-6" />
            )}
          </>
        </Button>
      ) : (
        <Button
          onClick={() => {
            submit(currentLesson.id);
            handleSetSearchParams(currentLesson.id);
          }}
          variant="outline"
          aria-label={currentLesson.title}
          className="flex items-center"
          disabled={
            currentLesson.status === STATUS.COMPLETED ||
            lessonId === currentLesson.id
          }
        >
          <>
            {lessonId === currentLesson.id ? (
              <FaSpinner size={20} className="mr-4 text-sky-600 animate-spin" />
            ) : (
              <FiCheckCircle className="inline h-6 w-6 mr-4 text-blue-600" />
            )}
            Mark as completed
          </>
        </Button>
      )}
    </div>
  );
}
