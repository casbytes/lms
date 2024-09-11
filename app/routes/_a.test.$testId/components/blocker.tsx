import { useBlocker } from "@remix-run/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

type BlockerProps = { isSubmitted: boolean; submitTest: () => void };

export function Blocker({ isSubmitted, submitTest }: BlockerProps) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isSubmitted && currentLocation.pathname !== nextLocation.pathname
  );

  const blocked = blocker.state === "blocked";

  function handleReset() {
    if (blocked) {
      blocker.reset();
    }
  }

  function handleProceed() {
    if (blocked) {
      submitTest();
      blocker.proceed();
    }
  }

  return blocked ? (
    <AlertDialog open={blocked} onOpenChange={handleReset}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to leave this page?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your test will be submitted with your current score.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleReset}>No</AlertDialogCancel>
          <AlertDialogAction onClick={handleProceed}>Yes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : null;
}
