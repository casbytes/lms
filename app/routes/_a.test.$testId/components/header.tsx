import { useInterval } from "use-interval";
import { format, addSeconds } from "date-fns";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/libs/shadcn";
import { Separator } from "~/components/ui/separator";
import { useLocalStorageState } from "~/utils/hooks";

type TestHeaderProps = {
  progress: number;
  questionsLength: number;
  submitTest: () => void;
  currentQuestionIndex: number;
};

export function TestHeader({
  progress,
  submitTest,
  questionsLength,
  currentQuestionIndex,
}: TestHeaderProps) {
  const TIME_KEY = "testTime";
  const timePerQuestion = 60; // 6 secs0 = 1 min.
  const INTERVAL = 1000; // 1sec.
  const SUBMIT_TIME = 0;
  const WARNING_TIME = 180; // 3 minutes (3 * 60 = 180 seconds)
  const ONE_MINUTE = 60;

  const totalTime = timePerQuestion * questionsLength;
  const [timeLeft, setTimeLeft] = useLocalStorageState(TIME_KEY, totalTime);

  function formatTime(seconds: number) {
    const time = addSeconds(new Date(SUBMIT_TIME), seconds);
    return format(time, "mm:ss");
  }

  useInterval(() => {
    setTimeLeft((prevTime) => {
      if (prevTime <= 1) {
        submitTest();
        window.localStorage.removeItem(TIME_KEY);
        return 0;
      } else {
        const newTimeLeft = prevTime - 1;
        window.localStorage.setItem(TIME_KEY, newTimeLeft.toString());
        return newTimeLeft;
      }
    });
  }, INTERVAL);

  return (
    <>
      <div className="flex gap-6 items-center mb-2 mt-6 bg-stone-200 rounded-md p-2">
        <div>
          Time left:{" "}
          <Badge
            className={cn("text-lg", {
              "bg-red-500 hover:bg-red-400": timeLeft <= WARNING_TIME,
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
