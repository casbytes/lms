import React from "react";
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
  submitForm: () => void;
  isFormSubmitted: boolean;
  testResponse: ITest | undefined;
  redirectUrl: string;
  dialogButtonRef: ReturnType<typeof React.useRef>;
};

export function TestDialog({
  submitForm,
  testResponse,
  dialogButtonRef,
  redirectUrl,
  isFormSubmitted,
}: TestDialogProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();

  const COMPLETED = testResponse?.status === TestStatus.COMPLETED;
  const LOCKED = testResponse?.status === TestStatus.LOCKED;

  const isSubmitting = navigation.formData?.get("intent") === "submit";

  function handleButtonClick() {
    submitForm();
  }

  /**
   * useEffect to handle window or tab change
   */
  React.useEffect(() => {
    function handleTabChange() {
      if (document.hidden && dialogButtonRef.current) {
        if (!isFormSubmitted) {
          (dialogButtonRef.current as HTMLButtonElement).click();
          submitForm();
        }
      }
    }

    document.addEventListener("visibilitychange", handleTabChange);
    return () => {
      document.removeEventListener("visibilitychange", handleTabChange);
    };
  }, [isFormSubmitted]);

  return (
    <DialogContent className="max-w-lg">
      {COMPLETED ? (
        <SuccessDialogContent testResponse={testResponse} />
      ) : LOCKED ? (
        <FailureDialogContent testResponse={testResponse} />
      ) : (
        <BeforeSubmissionDialogContent />
      )}

      <DialogFooter className="justify-between">
        <DialogClose asChild>
          <Button
            // onClick={() => (BLOCKED ? blocker.reset() : null)}
            type="button"
            variant="destructive"
            disabled={isSubmitting || isFormSubmitted}
          >
            No
          </Button>
        </DialogClose>
        <Button
          type="button"
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
      <DialogDescription>
        Score: {testResponse.score}%<span>Score: {testResponse.score}%</span>{" "}
      </DialogDescription>
    </DialogHeader>
  ) : null;
}
function FailureDialogContent({ testResponse }: TestResponseProps) {
  return testResponse && testResponse.status === TestStatus.LOCKED ? (
    <DialogHeader>
      <DialogTitle>Well tried!</DialogTitle>
      <DialogDescription>
        <span>Score: {testResponse.score}%</span> <br />
      </DialogDescription>
    </DialogHeader>
  ) : null;
}
