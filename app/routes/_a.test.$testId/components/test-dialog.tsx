import React, { useRef } from "react";
import { useBlocker, useNavigation, useNavigate } from "@remix-run/react";
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
  redirectUrl: string;
  handleSubmit: () => void;
  testResponse: ITest | undefined;
  dialogButtonRef: ReturnType<typeof useRef>;
};

export function TestDialog({
  redirectUrl,
  testResponse,
  handleSubmit,
  dialogButtonRef,
}: TestDialogProps) {
  const [isFormSubmitted, setIsFormSubmitted] = React.useState(false);
  const [redirectCountdown, setRedirectCountdown] = React.useState(10);
  const navigate = useNavigate();
  const navigation = useNavigation();

  const COMPLETED = testResponse?.status === TestStatus.COMPLETED;
  const LOCKED = testResponse?.status === TestStatus.LOCKED;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname
  );

  const BLOCKED = blocker.state === "blocked";
  const PROCEEDING = blocker.state === "proceeding";

  const isSubmitting = navigation.formData?.get("intent") === "submit";

  function handleButtonClick() {
    if (BLOCKED) {
      blocker.proceed();
      setIsFormSubmitted(true);
    } else {
      handleSubmit();
      setIsFormSubmitted(true);
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

  const INTERVAL = 1000;
  React.useEffect(() => {
    if (redirectCountdown > 0 && isFormSubmitted) {
      const timer = window.setTimeout(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, INTERVAL);

      return () => window.clearTimeout(timer);
    } else if (redirectCountdown === 0 && isFormSubmitted) {
      navigate(redirectUrl, { replace: true });
    }
  }, [redirectCountdown, isFormSubmitted]);

  return (
    <DialogContent className="max-w-lg">
      {BLOCKED ? (
        <BlockerDialogContent />
      ) : COMPLETED ? (
        <SuccessDialogContent
          testResponse={testResponse}
          redirectCountdown={redirectCountdown}
        />
      ) : LOCKED ? (
        <FailureDialogContent
          testResponse={testResponse}
          redirectCountdown={redirectCountdown}
        />
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
  redirectCountdown: number;
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
function SuccessDialogContent({
  testResponse,
  redirectCountdown,
}: TestResponseProps) {
  return testResponse && testResponse.status === TestStatus.COMPLETED ? (
    <DialogHeader>
      <DialogTitle>Success!</DialogTitle>
      <DialogDescription>
        Score: {testResponse.score}%<span>Score: {testResponse.score}%</span>{" "}
        <br />
        <span>Redirecting in {redirectCountdown} seconds...</span>
      </DialogDescription>
    </DialogHeader>
  ) : null;
}
function FailureDialogContent({
  testResponse,
  redirectCountdown,
}: TestResponseProps) {
  return testResponse && testResponse.status === TestStatus.LOCKED ? (
    <DialogHeader>
      <DialogTitle>Well tried!</DialogTitle>
      <DialogDescription>
        <span>Score: {testResponse.score}%</span> <br />
        <span>Redirecting in {redirectCountdown} seconds...</span>
      </DialogDescription>
    </DialogHeader>
  ) : null;
}
