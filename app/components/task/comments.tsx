import { TaskComment, User } from "~/utils/db.server";
import { TaskProps } from ".";
import { Comment } from "./comment";

type TaskCommentWithUser = TaskComment & {
  user: User;
};

type TaskWithCommentProps = TaskProps & {
  comments?: TaskCommentWithUser[];
};

type CommentProps = {
  task: TaskWithCommentProps;
  userId: string;
};

export function Comments({ task, userId }: CommentProps) {
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
