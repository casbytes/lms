import React from "react";
import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";

type PaginationProps = {
  testQuestionsLength: number;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
};

export function Pagination({
  testQuestionsLength,
  currentQuestionIndex,
  setCurrentQuestionIndex,
}: PaginationProps) {
  const checkPrev = currentQuestionIndex === 0;
  const checkNext = currentQuestionIndex < testQuestionsLength - 1;

  const handleNextQuestion = React.useCallback(() => {
    setCurrentQuestionIndex((prev) => prev + 1);
  }, [setCurrentQuestionIndex]);

  const handlePreviousQuestion = React.useCallback(() => {
    setCurrentQuestionIndex((prev) => prev - 1);
  }, [setCurrentQuestionIndex]);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8">
      <Button
        onClick={handlePreviousQuestion}
        disabled={checkPrev}
        size="lg"
        className="w-full md:w-auto bg-sky-600 hover:bg-sky-500"
      >
        Prevoius question.
      </Button>
      {checkNext ? (
        <Button
          onClick={handleNextQuestion}
          className="w-full md:w-auto bg-sky-600 hover:bg-sky-500"
          size="lg"
        >
          Next question.
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full md:w-auto text-lg"
            size="lg"
          >
            Submit
          </Button>
        </DialogTrigger>
      )}
    </div>
  );
}
