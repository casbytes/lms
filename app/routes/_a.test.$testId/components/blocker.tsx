import { useBlocker } from "@remix-run/react";
import { VscWarning } from "react-icons/vsc";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

type BlockerProps = { isSubmitted: boolean; submitTest: () => void };

export function Blocker({ isSubmitted, submitTest }: BlockerProps) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isSubmitted && currentLocation.pathname !== nextLocation.pathname
  );
  return (
    <>
      {blocker.state === "blocked" ? (
        <Alert variant="destructive" className="w-full text-md mt-4 relative">
          <VscWarning className="h-4 w-4 text-red-500" />
          <AlertTitle>Are you sure you want to leave this page?</AlertTitle>
          <AlertDescription>
            Your test will be submitted with your current score..
          </AlertDescription>
          <div className="flex flex-col w-full absolute top-4 right-4">
            <div className="self-end flex gap-4">
              <Button
                variant="outline"
                size={"sm"}
                onClick={() => blocker.reset()}
              >
                No
              </Button>
              <Button
                variant="destructive"
                size={"sm"}
                onClick={() => {
                  submitTest();
                  blocker.proceed();
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        </Alert>
      ) : null}
    </>
  );
}
