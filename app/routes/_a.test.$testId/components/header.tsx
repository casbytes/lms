import React from "react";
import { useNavigate } from "@remix-run/react";
import { useInterval } from "use-interval";
import { format, addSeconds } from "date-fns";
import { TestAlert } from "./test-alert";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/libs/shadcn";
import { Separator } from "~/components/ui/separator";

type TestHeaderProps = {
  progress: number;
  questionsLength: number;
  submitForm: () => Promise<void>;
  redirectUrl: string;
  currentQuestionIndex: number;
};

export function TestHeader({
  progress,
  submitForm,
  questionsLength,
  currentQuestionIndex,
}: TestHeaderProps) {
  const timePerQuestion = 1.5 * 60;
  const totalTime = timePerQuestion * questionsLength;

  const [alert, setAlert] = React.useState(true);
  const [timeLeft, setTimeLeft] = React.useState(totalTime);

  const navigate = useNavigate();

  const ALERT_TIMEOUT = 30000;
  const INTERVAL = 1000;
  const SUBMIT_TIME = 0;
  const WARNING_TIME = 300; // 5 minutes (5 * 60 = 300 seconds)
  const ONE_MINUTE = 60;

  function formatTime(seconds: number) {
    const time = addSeconds(new Date(SUBMIT_TIME), seconds);
    return format(time, "mm:ss");
  }

  const submitAndNavigate = React.useCallback(async () => {
    submitForm().then(() => navigate(-2));
  }, [submitForm, navigate]);

  useInterval(() => {
    setTimeLeft((prevTime) => prevTime - 1);
  }, INTERVAL);

  React.useEffect(() => {
    if (timeLeft === SUBMIT_TIME) {
      submitAndNavigate();
    }
  }, [submitAndNavigate, timeLeft]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setAlert(false);
    }, ALERT_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {alert ? <TestAlert /> : null}
      <div className="flex gap-6 items-center mb-2 mt-6 bg-stone-200 rounded-md p-2">
        <div>
          Time left:{" "}
          <Badge
            className={cn("text-lg", {
              "bg-yellow-500 hover:bg-yellow-400": timeLeft <= WARNING_TIME,
            })}
          >
            <span
              className={cn({
                "animate-bounce": timeLeft <= ONE_MINUTE,
              })}
            >
              {formatTime(timeLeft)}
            </span>
          </Badge>
        </div>
        <Separator orientation="vertical" className="h-10 bg-sky-700" />
        <div className="flex flex-1 items-center gap-4">
          <Progress value={progress} className="h-2" />
          <Badge className="text-lg">
            {currentQuestionIndex + 1}/{questionsLength}
          </Badge>
        </div>
      </div>
    </>
  );
}
