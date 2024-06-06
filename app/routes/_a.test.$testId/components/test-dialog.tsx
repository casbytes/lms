import React, { useRef } from "react";
import { useBlocker, useFetcher } from "@remix-run/react";
import { FaSpinner } from "react-icons/fa6";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { ITest, TestStatus } from "~/constants/types";

type TestDialogProps = {
  testResponse: ITest | undefined;
  handleSubmit: () => void;
  testFetcher: ReturnType<typeof useFetcher>;
  dialogButtonRef: ReturnType<typeof useRef>;
};

export function TestDialog({
  testFetcher,
  testResponse,
  handleSubmit,
  dialogButtonRef,
}: TestDialogProps) {
  const [isFormSubmitted, setIsFormSubmitted] = React.useState(false);
  console.log(testResponse);

  const COMPLETED = testResponse?.status === TestStatus.COMPLETED;
  const LOCKED = testResponse?.status === TestStatus.LOCKED;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !COMPLETED && currentLocation.pathname !== nextLocation.pathname
  );

  const BLOCKED = blocker.state === "blocked";
  const PROCEEDING = blocker.state === "proceeding";

  const isSubmitting = testFetcher.formData?.get("intent") === "submit";

  function handleButtonClick() {
    if (BLOCKED) {
      blocker.proceed();
    } else {
      handleSubmit();
    }
  }

  /**
   * useEffect to handle window or tab change
   */
  React.useEffect(() => {
    function handleTabChange() {
      if (document.hidden && dialogButtonRef.current) {
        if (!isFormSubmitted) {
          (dialogButtonRef.current as HTMLButtonElement).click();
          handleSubmit();
          setIsFormSubmitted(true);
        }
      }
    }

    document.addEventListener("visibilitychange", handleTabChange);
    return () => {
      document.removeEventListener("visibilitychange", handleTabChange);
    };
  }, [isFormSubmitted]);

  /**
   * useEffect to handle user navigation while taking the test
   */
  React.useEffect(() => {
    if (BLOCKED) {
      if (dialogButtonRef.current) {
        (dialogButtonRef.current as HTMLButtonElement).click();
      }
    }
    if (PROCEEDING) {
      handleSubmit();
    }
  }, [blocker.state]);

  return (
    <DialogContent className="max-w-lg">
      {BLOCKED ? (
        <BlockerDialogContent />
      ) : COMPLETED ? (
        <SuccessDialogContent testResponse={testResponse} />
      ) : LOCKED ? (
        <FailureDialogContent testResponse={testResponse} />
      ) : (
        <BeforeSubmissionDialogContent />
      )}

      <DialogFooter className="justify-between">
        <DialogClose asChild>
          <Button
            onClick={() => (BLOCKED ? blocker.reset() : null)}
            type="button"
            variant="destructive"
          >
            No
          </Button>
        </DialogClose>
        <Button
          type="button"
          value="test-submit"
          onClick={handleButtonClick}
          disabled={isSubmitting || isFormSubmitted}
        >
          {isSubmitting ? <FaSpinner className="mr-2 animate-spin" /> : null}
          Yes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function BeforeSubmissionDialogContent() {
  return (
    <DialogHeader>
      <DialogTitle>Are you sure you want to submit?</DialogTitle>
    </DialogHeader>
  );
}
type TestResponseProps = {
  testResponse: ITest | undefined;
};

function BlockerDialogContent() {
  return (
    <DialogHeader>
      <DialogTitle>Are you sure you want to leave this page?</DialogTitle>
      <DialogDescription>
        {/* <DialogDescription>Score: 70%</DialogDescription> */}
      </DialogDescription>
    </DialogHeader>
  );
}
function SuccessDialogContent({ testResponse }: TestResponseProps) {
  return testResponse && testResponse.status === TestStatus.COMPLETED ? (
    <DialogHeader>
      <DialogTitle>Success!</DialogTitle>
      <DialogDescription>Score: {testResponse.score}%</DialogDescription>
    </DialogHeader>
  ) : null;
}
function FailureDialogContent({ testResponse }: TestResponseProps) {
  return testResponse &&
    testResponse &&
    testResponse.status === TestStatus.LOCKED ? (
    <DialogHeader>
      <DialogTitle>Well tried!</DialogTitle>
      <DialogDescription>Score: {testResponse.score}%</DialogDescription>
    </DialogHeader>
  ) : null;
}
