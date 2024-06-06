interface CalculateScores {
  userAnswers: number[][];
  questions: {
    correctAnswer: number[];
  }[];
  setScores: (newScores: number[]) => void;
}

export function calculateScores(
  userAnswers: number[][],
  questions: { correctAnswer: number[] }[],
  setScores: (newScores: number[]) => void
) {
  const newScores = userAnswers.map((answer, index) => {
    const correctAnswerIds = questions[index].correctAnswer;
    return answer.length === correctAnswerIds.length &&
      answer.every((id: number) => correctAnswerIds?.includes(id))
      ? 1
      : 0;
  });
  setScores(newScores);
}

export function getTotalScore(
  scores: number[],
  questions: { correctAnswer: number[] }[]
) {
  return (
    (scores.reduce((acc, score) => acc + score, 0) / questions.length) * 100
  );
}
