import React from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { TestDialog } from "./components/test-dialog";
import { useLocalStorageState } from "~/utils/hooks";
import { FullPagePendingUI } from "~/components/full-page-pending-ui";
import { Options } from "./components/options";
import { getTest, handleTestSubmit, questions } from "./utils.server";
import { Pagination } from "./components/pagination";
import { TestHeader } from "./components/header";
import { Question } from "./components/question";
import { calculateScores, getTotalScore } from "./utils.client";
import { getUser } from "~/utils/sessions.server";
import { ITest } from "~/constants/types";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getUser(request);
  const test = await getTest(request, params);
  return json({ questions, test, user });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const testResponse = await handleTestSubmit(request);
    console.log("Client res;", testResponse);

    return json(testResponse);
  } catch (error) {}
}

export default function TestRoute() {
  const { questions, user, test } = useLoaderData<typeof loader>();
  const testResponse = useActionData<typeof action>() as ITest;
  console.log("TR", testResponse);

  const [isServer, setIsServer] = React.useState(true);
  const testFetcher = useFetcher();
  const dialogButtonRef = React.useRef<HTMLButtonElement>(null);

  let moduleProgressId = test?.moduleProgressId;
  let subModuleProgressId = test?.subModuleProgressId;

  function handleSubmit() {
    testFetcher.submit(
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
  }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useLocalStorageState(
    "currentQuestionIndex",
    0
  );

  const [userAnswers, setUserAnswers] = useLocalStorageState(
    "userAnswers",
    Array(questions.length).fill([])
  );

  const [scores, setScores] = React.useState<number[]>(
    Array(questions.length).fill(0)
  );

  /**
   * Calculates the total score of the user and returns it
   * @returns {Number} The total score of the user in percent
   */
  function getUserScore(): number {
    calculateScores(userAnswers, questions, setScores);
    return getTotalScore(scores, questions);
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

  React.useEffect(() => {
    getUserScore();
  }, [userAnswers]);

  React.useEffect(() => {
    setIsServer(false);
  }, []);

  if (isServer) return <FullPagePendingUI />;
  return (
    <Dialog>
      <Container className="max-w-4xl">
        <BackButton to={moduleOrSubModuleUrl} buttonText={testTitle} />
        <PageTitle title={`${moduleOrSubModuleTitle} 👀`} />
        <TestHeader
          progress={progress}
          questionsLength={questionsLength}
          handleSubmit={handleSubmit}
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
          testResponse={testResponse}
          testFetcher={testFetcher}
          handleSubmit={handleSubmit}
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
