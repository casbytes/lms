import { Link } from "@remix-run/react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { IoAlertCircleOutline } from "react-icons/io5";

export default function TestIndexRoute() {
  const testTitle = "JavaScript functions";
  return (
    <Container className="bg-header-2 bg-no-repeat min-h-screen">
      <div className="max-w-5xl mx-auto min-h-screen">
        <BackButton to="/modules/1" buttonText="sub module" />
        <PageTitle title="Test Your Knowledge: JavaScript functions" />
        <div className="flex flex-col md:flex-row gap-6 my-8 items-start">
          <div className="flex flex-col gap-6">
            <p className="text-xl text-zinc-700 max-w-lg">
              Welcome to the {testTitle} test! This test is designed to assess
              your understanding of JavaScript functions.
            </p>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Click on the 'Start Test' button to start the test.</li>
              <li>
                Read each question carefully and select the correct answer(s).
              </li>
              <li>
                Multiple-choice questions will be indicated; choose the correct
                answers.
              </li>
              <li>Choose only one answer for non-multiple-choice questions.</li>
              <li>
                Click the "Next question" button to move to the next question.
              </li>
              <li>
                After answering all the questions, review your answers before
                clicking the 'Submit' button.
              </li>
              <li>
                You are adviced not to use any external resources during the
                test to get the best results.
              </li>
              <li>
                You must score up to 80% to pass the test and proceed to your
                checkpoint.
              </li>
              <li>
                If you score below 80%, you can retake the test after 24 hours.
              </li>
            </ol>
          </div>
          <div className="self-start">
            <img
              src="https://cdn.casbytes.com/assets/test.png"
              className="hidden md:block w-[450px] h-[450px] object-cover rounded-lg shadow-sm"
              width={450}
              height={450}
              alt="Test"
            />
          </div>
        </div>
        <Alert variant="destructive" className="max-w-3xl mx-auto -mt-4">
          <IoAlertCircleOutline className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Please stay focused on the test during this time. If you navigate
            away from your test window or tab, your test will be submitted
            automatically. If your score is below 80%, you will need to wait for
            24 hours before retaking the test.
          </AlertDescription>
        </Alert>
        <Button className="md:mt-4 w-full text-lg" size="lg">
          <Link to="/modules/test/1" className="w-full">
            Start Test
          </Link>
        </Button>
      </div>
    </Container>
  );
}
