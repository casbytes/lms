import React from "react";
import { MdOutlineDeleteForever, MdOutlineSave } from "react-icons/md";
import { Textarea } from "../ui/textarea";
import { useFetcher } from "@remix-run/react";
import { GrFormClose } from "react-icons/gr";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaEdit } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { Role } from "~/constants/enums";

export function Comment({ task, comment, userId }: any) {
  const [isCommenting, setIsCommenting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [commentContent, setCommentContent] = React.useState(comment.content);

  const cf = useFetcher();
  const commentId = cf.formData?.get("commentId");
  const isOwner = comment.user!.id === userId;

  function handleUpdateComment() {
    if (isCommenting) {
      cf.submit(
        {
          intent: "updateComment",
          comment: commentContent,
          commentId: comment.id,
          taskId: task.id,
        },
        { method: "POST" }
      );
      setIsCommenting(false);
    } else {
      setIsCommenting(true);
    }
  }

  function handleDeleteComment() {
    setIsDeleting(true);
    cf.submit(
      { intent: "deleteComment", commentId: comment.id, taskId: task.id },
      { method: "POST" }
    );
  }
  return (
    <li className="bg-stone-200/50 rounded-md p-3">
      <h2 className="flex mb-1 justify-between">
        <span className="text-indigo-800">
          {isOwner && comment.user!.role !== Role.USER ? "Mentor" : "Me"}
        </span>
        <div className="flex gap-4 tasks-center">
          <span className="text-slate-500 text-sm">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          {isOwner ? (
            <div className="flex gap-4">
              <button onClick={handleUpdateComment}>
                {isCommenting ? (
                  commentId === comment.id ? (
                    <CgSpinnerTwo className="text-blue-600" />
                  ) : (
                    <MdOutlineSave className="text-blue-600" />
                  )
                ) : (
                  <FaEdit className="text-blue-600" />
                )}
              </button>
              {isCommenting ? (
                <button onClick={() => setIsCommenting(false)}>
                  <GrFormClose size={20} className="text-red-500" />
                </button>
              ) : null}
              <button
                onClick={handleDeleteComment}
                disabled={commentId === comment.id}
              >
                {isDeleting && commentId === comment.id ? (
                  <CgSpinnerTwo className="text-blue-600 animate-spin" />
                ) : (
                  <MdOutlineDeleteForever size={20} className="text-red-500" />
                )}
              </button>
            </div>
          ) : null}
        </div>
      </h2>
      {isCommenting ? (
        <Textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          className="mt-2"
          placeholder="Add your comment here..."
        />
      ) : (
        <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
      )}
    </li>
  );
}
