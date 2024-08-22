import { Separator } from "~/components/ui/separator";
import { Question as QProps } from "../utils.server";
import { Markdown } from "~/components/markdown";
import { Badge } from "~/components/ui/badge";

type QuestionsProps = {
  currentQuestion: QProps;
};

export function Question({ currentQuestion }: QuestionsProps) {
  return (
    <div className="my-4">
      <Separator className="bg-slate-700" />
      <Markdown source={currentQuestion.question} />
      {currentQuestion?.isMultiple ? (
        <Badge className="bg-zinc-600 hover:bg-zinc-500">
          Select all that apply
        </Badge>
      ) : null}
    </div>
  );
}
