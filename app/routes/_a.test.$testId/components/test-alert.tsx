import { IoAlertCircleOutline } from "react-icons/io5";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function TestAlert() {
  return (
    <Alert variant="destructive" className="mt-4">
      <IoAlertCircleOutline className="h-4 w-4" />
      <AlertTitle className="text-xl font-black">Important Notice</AlertTitle>
      <AlertDescription>
        <ul className="list-square list-disc">
          <h3 className="text-lg font-bold">Test Conduct:</h3>
          <li>
            Do not use any external resources during the test to ensure fair
            evaluation.
          </li>
          <li>
            Stay Focused: Remain within the test window throughout the exam.
            Leaving the window will automatically submit your test with your
            current answers.
          </li>
          <li>
            Do not navigate away: Avoid navigating away from the quiz page.
            Doing so will automatically submit your test with your current
            answers.
          </li>
        </ul>
        <h3 className="text-lg font-bold">Retake Eligibility:</h3>
        <ul className="list-disc list-inside">
          <li>
            Scores below 80% require a 24-hour waiting period before retaking
            the test.
          </li>
          <li>
            Subsequent retakes will have a waiting period that increases by 24
            hours for each attempt (e.g., 48 hours for the second try, 72 hours
            for the third try, and so on).
          </li>
          <li>
            This is to enable you to review the material and improve your
            knowledge before retaking the test.
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
