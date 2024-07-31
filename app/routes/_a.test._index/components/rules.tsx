/* eslint-disable react/no-unescaped-entities */
export function Rules() {
  return (
    <>
      <h2>
        <strong className="text-xl font-black text-sky-700">Test Rules:</strong>
      </h2>
      <ol className="space-y-2 list-decimal list-inside">
        <h3 className="text-xl font-black">Starting the Test:</h3>
        <li>Click the "Start Test" button to begin.</li>
        <h3 className="text-xl font-black">Answering Questions:</h3>
        <li>Read each question thoroughly and select the correct answer(s).</li>
        <li>
          <strong className="text-lg">Multiple Choice:</strong> If instructed to
          "Select all that apply," choose all relevant answers.
        </li>
        <li>For non-multiple-choice questions, select only one answer.</li>
        <li>Click "Next Question" to proceed to the next question.</li>
        <h3 className="text-xl font-black">Finishing the Test:</h3>
        <li>Review your answers carefully before clicking "Submit."</li>
        <li>
          <strong>Important:</strong> The test is timed and will automatically
          submit when the time elapses.
        </li>
        <h3 className="text-xl font-black">Test Conduct:</h3>
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
          Do not navigate away: Avoid navigating away from the quiz page. Doing
          so will automatically submit your test with your current answers.
        </li>
        <h3 className="text-xl font-black">Retake Eligibility:</h3>
        <li>
          <ul className="list-disc list-inside">
            <li>
              Scores below 80% require a 24-hour waiting period before retaking
              the test.
            </li>
            <li>
              Subsequent retakes will have a waiting period that increases by 24
              hours for each attempt (e.g., 48 hours for the second try, 72
              hours for the third try, and so on).
            </li>
          </ul>
        </li>
      </ol>
    </>
  );
}
