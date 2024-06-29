import { TaskProps } from ".";
import { Comment } from "./comment";

export function Comments({ task, userId }: TaskProps) {
  return (
    <ul className="space-y-2">
      {task.comments?.length ? (
        task.comments.map((comment) => (
          <Comment
            comment={comment}
            task={task}
            key={comment.id}
            userId={userId}
          />
        ))
      ) : (
        <li className="text-center text-lg text-slate-500">No comments!</li>
      )}
    </ul>
  );
}
