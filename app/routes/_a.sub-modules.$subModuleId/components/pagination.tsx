import { useSubmit, useNavigation, useNavigate } from "@remix-run/react";
import type {
  LessonProgress,
  ModuleProgress,
  SubModuleProgress,
} from "~/utils/db.server";
import { FaSpinner } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { Button } from "~/components/ui/button";
import { Status } from "~/constants/enums";

type LessonWithModule = LessonProgress & {
  subModuleProgress: SubModuleProgress & {
    moduleProgress: ModuleProgress;
  };
};

type PaginationProps = {
  currentLessonData: {
    previousLesson: LessonWithModule;
    currentLesson: LessonWithModule;
    nextLesson: LessonWithModule;
  };
};

export function Pagination({ currentLessonData }: PaginationProps) {
  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const lessonSlug = navigation.formData?.get("lessonSlug");
  const { previousLesson, currentLesson, nextLesson } = currentLessonData;
  const moduleTitle = currentLesson.subModuleProgress?.moduleProgress?.title;
  const redirectUrl = `/courses/${currentLesson?.subModuleProgress?.moduleProgress?.courseProgressId}?moduleId=${currentLesson?.subModuleProgress?.moduleProgressId}`;

  return (
    <div className="flex flex-col gap-4 md:flex-row justify-between">
      {previousLesson ? (
        <Button
          onClick={() => submit({ lessonSlug: previousLesson.slug })}
          variant="outline"
          aria-label={previousLesson.title}
          className="flex items-center"
          disabled={lessonSlug === previousLesson.slug}
        >
          <>
            {lessonSlug === previousLesson.slug ? (
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
          onClick={() => submit({ lessonSlug: nextLesson.slug })}
          variant="outline"
          aria-label={nextLesson.title}
          className="flex items-center"
          disabled={lessonSlug === nextLesson.slug}
        >
          <>
            {nextLesson.title}{" "}
            {lessonSlug === nextLesson.slug ? (
              <FaSpinner size={20} className="ml-4 text-sky-600 animate-spin" />
            ) : (
              <RiArrowRightSLine size={20} className="inline h-6 w-6" />
            )}
          </>
        </Button>
      ) : (
        <Button
          onClick={() => submit({ lessonSlug: currentLesson.slug })}
          variant="outline"
          aria-label={currentLesson.title}
          className="flex items-center"
          disabled={
            currentLesson.status === Status.COMPLETED ||
            lessonSlug === currentLesson.slug
          }
        >
          <>
            {lessonSlug === currentLesson.slug ? (
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
