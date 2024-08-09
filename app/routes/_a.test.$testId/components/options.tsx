import React from "react";
import { Markdown } from "~/components/markdown";
import { Separator } from "~/components/ui/separator";
import { Question } from "../utils.server";

type OptionsProps = {
  userAnswers: number[][];
  currentQuestion: Question;
  setUserAnswers: React.Dispatch<React.SetStateAction<number[][]>>;
  currentAnswer: number[];
  currentQuestionIndex: number;
};

function Ops({
  userAnswers,
  currentAnswer,
  currentQuestion,
  setUserAnswers,
  currentQuestionIndex,
}: OptionsProps) {
  function handleOptionChange(optionId: number, checked: boolean) {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = checked
      ? [...newAnswers[currentQuestionIndex], optionId]
      : newAnswers[currentQuestionIndex].filter(
          (id: number) => id !== optionId
        );
    setUserAnswers(newAnswers);
  }

  function indexToLetter(index: number) {
    return String.fromCharCode(65 + index);
  }
  return (
    <ul>
      {currentQuestion.options.map((option, index) => (
        <li
          key={`option-${option.id}-${index}`}
          className="flex flex-col p-2 items-start justify-start"
        >
          <label className="flex gap-4 items-start w-full">
            <span className="mt-4">{indexToLetter(index)}.</span>
            <input
              type="checkbox"
              id={`option-${option.id}`}
              checked={currentAnswer.includes(option.id)}
              onChange={(e) => handleOptionChange(option.id, e.target.checked)}
              className="mt-[1.35rem]"
            />
            <Markdown source={option.text} />
          </label>
          {index < currentQuestion.options.length - 1 ? (
            <Separator className="h-1 bg-zinc-300" />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export const Options = React.memo(Ops);
