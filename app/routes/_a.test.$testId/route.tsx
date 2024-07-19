import React from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useSubmit, useLoaderData, useNavigation } from "@remix-run/react";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { TestDialog } from "./components/test-dialog";
import { useLocalStorageState } from "~/utils/hooks";
import { FullPagePendingUI } from "~/components/full-page-pending-ui";
import { Options } from "./components/options";
import { getTest, questions, updateTest } from "./utils.server";
import { Pagination } from "./components/pagination";
import { TestHeader } from "./components/header";
import { Question } from "./components/question";
import { getUser } from "~/utils/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getUser(request);
  const test = await getTest(request, params);
  return json({ questions, test, user });
}

export async function action({ request }: ActionFunctionArgs) {
  await updateTest(request);
  return null;
}

export default function TestRoute() {
  const { questions, user, test } = useLoaderData<typeof loader>();

  const submit = useSubmit();
  const navigation = useNavigation();
  const dialogButtonRef = React.useRef<HTMLButtonElement>(null);

  const isSubmitting = navigation.formData?.get("intent") === "submit";

  const [isServer, setIsServer] = React.useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = React.useState(false);
  const [scores, setScores] = React.useState<number[]>(
    Array(questions.length).fill(0)
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useLocalStorageState(
    "currentQuestionIndex",
    0
  );
  const [userAnswers, setUserAnswers] = useLocalStorageState(
    "userAnswers",
    Array(questions.length).fill([])
  );

  const moduleProgressId = test?.moduleProgressId;
  const subModuleProgressId = test?.subModuleProgressId;

  /**
   * Calculates the scores of the user based on the answers provided
   */

  const calculateScores = React.useCallback(() => {
    const newScores = userAnswers.map((answer, index) => {
      const correctAnswerIds = questions[index].correctAnswer;
      return answer.length === correctAnswerIds.length &&
        answer.every((id: number) => correctAnswerIds?.includes(id))
        ? 1
        : 0;
    });
    setScores(newScores);
  }, [questions, userAnswers]);

  /**
   *  Calculates the total score of the user score and returns it
   * @returns {Number} The total score of the user in percent
   */

  const getTotalScore = React.useCallback(() => {
    return (
      (scores.reduce((acc, score) => acc + score, 0) / questions.length) * 100
    );
  }, [scores, questions]);

  /**
   * Calculates the total score of the user score and returns it
   * @returns {Number} The total score of the user in percent
   */
  const getUserScore = React.useCallback(() => {
    calculateScores();
    return getTotalScore();
  }, [calculateScores, getTotalScore]);

  /**
   * Programmatically submits the test form
   */
  async function handleSubmit() {
    return new Promise<void>((resolve) => {
      submit(
        {
          testId: test.id,
          userId: user.id,
          intent: "submit",
          moduleProgressId: moduleProgressId ?? null,
          subModuleProgressId: subModuleProgressId ?? null,
          score: getUserScore().toFixed(0),
        },
        { method: "POST" }
      );
      window.localStorage.removeItem("currentQuestionIndex");
      window.localStorage.removeItem("userAnswers");
      setIsFormSubmitted(true);
      resolve();
    });
  }

  const moduleTest = test?.moduleProgressId ? true : false;
  const defaultTitle = "Matters choke!";
  const testTitle = test.title ?? defaultTitle;

  const moduleOrSubModuleTitle = moduleTest
    ? test?.moduleProgress?.title
    : test?.subModuleProgress?.title ?? defaultTitle;

  const moduleOrSubModuleUrl = moduleTest
    ? `/courses/${test?.moduleProgressId}`
    : `/sub-modules/${test?.subModuleProgressId}`;

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];
  const questionsLength = questions.length;
  const checkPrev = currentQuestionIndex === 0;
  const checkNext = currentQuestionIndex < questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questionsLength) * 100;

  /**
   * useEffect to update the user score when the user answers a question
   */
  React.useEffect(() => {
    getUserScore();
  }, [getUserScore, userAnswers]);

  /**
   * useEffect to check for hydration
   */
  React.useEffect(() => {
    setIsServer(false);
  }, []);

  if (isServer || isSubmitting) return <FullPagePendingUI />;
  return (
    <Dialog>
      <Container className="max-w-4xl">
        <BackButton to={moduleOrSubModuleUrl} buttonText={testTitle} />
        <PageTitle title={`${moduleOrSubModuleTitle} 👀`} />
        <TestHeader
          progress={progress}
          submitForm={handleSubmit}
          questionsLength={questionsLength}
          redirectUrl={moduleOrSubModuleUrl}
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
        <Pagination
          checkNext={checkNext}
          checkPrev={checkPrev}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
        />
        <TestDialog
          submitForm={handleSubmit}
          isFormSubmitted={isFormSubmitted}
          dialogButtonRef={dialogButtonRef}
        />

        {/* Because the dialog trigger button is only rendered when a student is on the last question,
        we can't access it before then so we have to come up with a way to trigger the dialog
        when a student's test window or tab looses focus so we can automatically submit their test
        and display their result to them on the dialog. That is why this button is here. */}
        <DialogTrigger ref={dialogButtonRef} />
      </Container>
    </Dialog>
  );
}
