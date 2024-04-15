import React from "react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { subHours } from "date-fns";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { TestDialog } from "./components/test-dialog";
import { useLoaderData } from "@remix-run/react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { useLocalStorageState } from "~/utils/hooks";
import { FullPagePendingUI } from "~/components/full-page-pending-ui";

interface Option {
  id: number;
  text: string;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
  correctAnswer: number[]; // Contains IDs of correct options
}

export async function loader() {
  const questions: Question[] = [
    {
      id: 0,
      question:
        "Which programming languages do you know? `console.log('Hello, World!')`",
      options: [
        { id: 0, text: "JavaScript" },
        { id: 1, text: "TypeScript" },
        { id: 2, text: "Python" },
        { id: 3, text: "Java" },
      ],
      correctAnswer: [0, 1], // User can select JavaScript and TypeScript
    },
    {
      id: 1,
      question: "Which front-end frameworks do you know?",
      options: [
        { id: 0, text: "React" },
        {
          id: 1,
          text: "Angularfdsakjhgfvbjnkm,;lkjhgfcvhbjnkm\
        jkhgfdhjkljhgfdsdfghjkjhgfdgh\
        hjgfdszxghjjhgfdszfxgchvjkhgfdgch\
        hbjfgdghjklhgfdxcgvhjkhghvjbnjhgv",
        },
        { id: 2, text: "Vue.js" },
        { id: 3, text: "Svelte" },
      ],
      correctAnswer: [0, 2], // User can select React and Vue.js
    },
    {
      id: 2,
      question: "Which back-end frameworks do you know?",
      options: [
        { id: 0, text: "Node.js" },
        { id: 1, text: "Django" },
        { id: 2, text: "Express.js" },
        { id: 3, text: "Spring" },
      ],
      correctAnswer: [0, 1], // User can select Node.js and Django
    },
    {
      id: 3,
      question: "Which databases do you know?",
      options: [
        { id: 0, text: "MySQL" },
        { id: 1, text: "PostgreSQL" },
        { id: 2, text: "MongoDB" },
        { id: 3, text: "SQLite" },
      ],
      correctAnswer: [0, 1, 2], // User can select MySQL, PostgreSQL, and MongoDB
    },
    {
      id: 4,
      question: "Which cloud providers do you know?",
      options: [
        { id: 0, text: "AWS" },
        { id: 1, text: "Azure" },
        { id: 2, text: "Google Cloud" },
        { id: 3, text: "DigitalOcean" },
      ],
      correctAnswer: [0, 1, 2], // User can select AWS, Azure, and Google Cloud
    },
    {
      id: 5,
      question: "Which version control systems do you know?",
      options: [
        { id: 0, text: "Git" },
        { id: 1, text: "SVN" },
        { id: 2, text: "Mercurial" },
        { id: 3, text: "Perforce" },
      ],
      correctAnswer: [0], // User can select Git
    },
    // Add more questions here
  ];

  return json({ questions });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const score = formData.get("score");
  console.log("Submitted score: ", score);
  const timestamp = new Date().toUTCString();

  return {};
}

export default function TestRoute() {
  const { questions } = useLoaderData<typeof loader>();

  const [isServer, setIsServer] = React.useState(true);

  const [currentQuestion, setCurrentQuestion] = useLocalStorageState(
    "currentQuestion",
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
   * Handles the change of an option in a question
   * @param {Number} optionId
   * @param {Boolean} checked
   */
  function handleOptionChange(optionId: number, checked: boolean) {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = checked
      ? [...newAnswers[currentQuestion], optionId]
      : newAnswers[currentQuestion].filter((id: number) => id !== optionId);
    setUserAnswers(newAnswers);
  }

  /**
   * Handles the next question
   */
  function handleNextQuestion() {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = userAnswers[currentQuestion];
    setUserAnswers(newAnswers);
    setCurrentQuestion((prev) => prev + 1);
  }

  /**
   * Handles the previous question
   */
  function handlePreviousQuestion() {
    setCurrentQuestion((prev) => prev - 1);
  }

  /**
   * Calculates the scores of the user
   */
  function calculateScores() {
    const newScores = userAnswers.map((answer, index) => {
      const correctAnswerIds = questions[index].correctAnswer;
      return answer.length === correctAnswerIds.length &&
        answer.every((id: number) => correctAnswerIds?.includes(id))
        ? 1
        : 0;
    });
    setScores(newScores);
  }

  /**
   * Calculates the total score of the user and returns it
   * @returns {Number} The total score of the user in percent
   */
  function getTotalScore(): number {
    return (
      (scores.reduce((acc, score) => acc + score, 0) / questions.length) * 100
    );
  }

  /**
   * Calculates the total score of the user and returns it
   * @returns {Number} The total score of the user in percent
   */
  function getScore(): number {
    calculateScores();
    return getTotalScore();
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const checkNext = currentQuestion < questions.length - 1;
  const checkPrev = currentQuestion === 0;

  React.useEffect(() => {
    getScore();
  }, [userAnswers]);

  React.useEffect(() => {
    setIsServer(false);
  }, []);

  if (isServer) return <FullPagePendingUI />;

  return (
    <Dialog>
      <Container className="max-w-4xl">
        <BackButton to="/modules/test" buttonText="test" />

        <PageTitle title={`Javascript functions`} />
        <div className="my-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Please stay focused on the test during this time. If you navigate
              away from this window or tab, your test will be submitted
              automatically. If your score is below 80%, you will need to wait
              for 24 hours before retaking the test.
            </AlertDescription>
          </Alert>
        </div>
        <div className="flex gap-6 items-center my-2">
          <Progress value={progress} className="h-2" />
          <Badge className="text-lg">
            {currentQuestion + 1}/{questions.length}
          </Badge>
        </div>

        <div>
          <div className="my-6">
            <div className="bg-sky-200 p-2 rounded-md">
              Choose all that apply
            </div>
            <Markdown source={questions[currentQuestion].question} />
          </div>
          <Separator />

          <ul>
            {questions[currentQuestion].options.map((option, index) => (
              <li key={`option-${option.id}`}>
                <label className="flex gap-4">
                  <input
                    type="checkbox"
                    checked={userAnswers[currentQuestion].includes(option.id)}
                    onChange={(e) =>
                      handleOptionChange(option.id, e.target.checked)
                    }
                  />
                  <Markdown source={option.text} />
                </label>
                {index < questions[currentQuestion].options.length - 1 ? (
                  <Separator />
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8">
          <Button
            onClick={handlePreviousQuestion}
            disabled={checkPrev}
            size="lg"
            className="w-full md:w-auto"
          >
            Prevoius question.
          </Button>
          {checkNext ? (
            <Button
              onClick={handleNextQuestion}
              className="w-full md:w-auto"
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
              <Button type="button" className="w-full md:w-auto" size="lg">
                Submit
              </Button>
            </DialogTrigger>
          )}
        </div>
        {/* Because the dialog trigger button is only rendered when a student is on the last question,
        we can't access it before then so we have to come up with a way to trigger the dialog
        when a student's test window or tab looses focus so we can automatically submit their test
        and display their result to them on the dialog. That is why this button is here. */}
        <DialogTrigger id="dialog-button-trigger" />

        {/* Test dialog */}
        <TestDialog getScore={getScore} />
      </Container>
    </Dialog>
  );
}
