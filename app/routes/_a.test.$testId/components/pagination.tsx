import React from "react";
import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";

type PaginationProps = {
  checkNext: boolean;
  checkPrev: boolean;
  userAnswers: number[][];
  setUserAnswers: React.Dispatch<React.SetStateAction<number[][]>>;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
};

export function Pagination({
  checkNext,
  checkPrev,
  userAnswers,
  setUserAnswers,
  currentQuestionIndex,
  setCurrentQuestionIndex,
}: PaginationProps) {
  /**
   * Handles the next question
   */
  function handleNextQuestion() {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = userAnswers[currentQuestionIndex];
    setUserAnswers(newAnswers);
    setCurrentQuestionIndex((prev) => prev + 1);
  }

  /**
   * Handles the previous question
   */
  function handlePreviousQuestion() {
    setCurrentQuestionIndex((prev) => prev - 1);
  }
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
        /**
         * This button triggers the dialog when a student
         * confirms if they want to submit the test
         * Subsequent actions are performed on the dialog
         */
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
