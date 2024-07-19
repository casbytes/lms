import type { LessonProgress } from "~/utils/db.server";
import { Lesson } from "./lesson";

type LessonsProps = {
  lessons: LessonProgress[];
};

export function Lessons({ lessons }: LessonsProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 p-2">
      {lessons && lessons?.length ? (
        lessons.map((lesson) => <Lesson lesson={lesson} key={lesson.id} />)
      ) : (
        <p>There are no lessons in this sub module</p>
      )}
    </ul>
  );
}
