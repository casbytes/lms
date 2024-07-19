import * as React from "react";
import { differenceInSeconds } from "date-fns";

function useLearningTimer() {
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = React.useState<number>(0);
  const [isRunning, setIsRunning] = React.useState(false);

  const startTimer = React.useCallback(() => {
    setStartTime(new Date());
    setIsRunning(true);
  }, []);

  const HOUR_IN_SECONDS = 3600;
  const stopTimer = React.useCallback(() => {
    if (isRunning) {
      const endTime = new Date();
      const timeSpent =
        differenceInSeconds(endTime, startTime!) / HOUR_IN_SECONDS;
      setElapsedTime((prev) => prev + timeSpent);
      setStartTime(null);
      setIsRunning(false);
    }
  }, [startTime, isRunning]);

  React.useEffect(() => {
    const handleBeforeUnload = () => stopTimer();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [stopTimer]);

  return { elapsedTime, startTimer, stopTimer, isRunning };
}

export { useLearningTimer };
