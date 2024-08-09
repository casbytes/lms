import React from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useSubmit, useLoaderData } from "@remix-run/react";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Dialog } from "~/components/ui/dialog";
import { TestDialog } from "./components/test-dialog";
import { useLocalStorageState } from "~/utils/hooks";
import { FullPagePendingUI } from "~/components/full-page-pending-ui";
import { Options } from "./components/options";
import { getTest, updateTest } from "./utils.server";
import { Pagination } from "./components/pagination";
import { TestHeader } from "./components/header";
import { Question } from "./components/question";
import { getUser } from "~/utils/session.server";
import { metaFn } from "~/utils/meta";
import { Blocker } from "./components/blocker";

export const meta = metaFn;

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const user = await getUser(request);
    const { test, testQuestions } = await getTest(request, params);
    return json({ test, testQuestions, user });
  } catch (error) {
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    return await updateTest(request);
  } catch (error) {
    throw error;
  }
}

export default function TestRoute() {
  const { test, testQuestions } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [isServer, setIsServer] = React.useState(true);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [score, setScore] = useLocalStorageState("testScore", 0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useLocalStorageState(
    "currentQuestionIndex",
    0
  );
  const [userAnswers, setUserAnswers] = useLocalStorageState(
    "userAnswers",
    Array(testQuestions.length).fill([])
  );

  const moduleId = test?.moduleId ?? null;
  const subModuleId = test?.subModuleId ?? null;
  const moduleTest = Boolean(moduleId);

  const defaultTitle = "Matters choke!";
  const testTitle = test.title;
  const moduleOrSubModuleTitle =
    test?.module?.title ?? test?.subModule?.title ?? defaultTitle;

  const moduleOrSubModuleUrl = moduleTest
    ? `/courses/${test?.module?.courseId}?moduleId=${test?.moduleId}`
    : `/sub-modules/${test?.subModuleId}`;

  const currentQuestion = testQuestions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];
  const testQuestionsLength = testQuestions.length;
  const progress = ((currentQuestionIndex + 1) / testQuestionsLength) * 100;

  React.useEffect(() => {
    const newScores = userAnswers.map((answer, index) => {
      const correctAnswerIds = testQuestions[index]?.correctAnswer ?? [];
      return answer.length === correctAnswerIds.length &&
        answer.every((id: number) => correctAnswerIds.includes(id))
        ? 1
        : 0;
    });

    const calculatedTotalScore =
      (newScores.reduce<number>((acc, score) => acc + score, 0) /
        testQuestions.length) *
      100;
    setScore(Number(calculatedTotalScore.toFixed(0)));
  }, [userAnswers, testQuestions, setScore]);

  const handleSubmit = React.useCallback(() => {
    submit(
      {
        score,
        testId: test.id,
        intent: "submit",
        itemId: moduleId ?? subModuleId,
        redirectUrl: moduleOrSubModuleUrl,
      },
      { method: "POST" }
    );
    setIsSubmitted(true);
  }, [submit, score, moduleId, subModuleId, test.id, moduleOrSubModuleUrl]);

  React.useEffect(() => {
    if (isSubmitted) {
      window.localStorage.removeItem("testTime");
      window.localStorage.removeItem("testScore");
      window.localStorage.removeItem("testAlert");
      window.localStorage.removeItem("userAnswers");
      window.localStorage.removeItem("currentQuestionIndex");
    }
    setIsSubmitted(false);
  }, [isSubmitted]);

  React.useEffect(() => {
    setIsServer(false);
  }, []);

  if (isServer) return <FullPagePendingUI />;

  return (
    <Container className="max-w-4xl">
      <BackButton to={moduleOrSubModuleUrl} buttonText={testTitle} />
      <PageTitle title={`${moduleOrSubModuleTitle} 👀`} />
      <Blocker isSubmitted={isSubmitted} submitTest={handleSubmit} />
      <TestHeader
        progress={progress}
        submitTest={handleSubmit}
        questionsLength={testQuestionsLength}
        currentQuestionIndex={currentQuestionIndex}
      />
      <Question currentQuestion={currentQuestion} />
      <Options
        userAnswers={userAnswers}
        currentAnswer={currentAnswer}
        currentQuestion={currentQuestion}
        setUserAnswers={setUserAnswers}
        currentQuestionIndex={currentQuestionIndex}
      />
      <Dialog>
        <Pagination
          testQuestionsLength={testQuestionsLength}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
        />
        <TestDialog submitTest={handleSubmit} />
      </Dialog>
    </Container>
  );
}
