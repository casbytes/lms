import React from "react";
import { useFetcher } from "@remix-run/react";
import { FaSpinner } from "react-icons/fa6";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

type TestDialogProps = {
  getScore: () => number;
};

export function TestDialog({ getScore }: TestDialogProps) {
  const [isFormSubmitted, setIsFormSubmitted] = React.useState(false);

  const test = useFetcher();

  function handleSubmit() {
    test.submit(
      { score: getScore().toFixed(0), userId: "" },
      { method: "POST" }
    );
  }

  const isSubmitting =
    test.formData?.get("userId") !== (null || undefined) &&
    test.formData?.get("score") !== (null || undefined);

  /**
   * After the dialog is open, we can now call the handleSubmit function
   * to submit the form programmatically
   */
  React.useEffect(() => {
    function handleTabChange() {
      const dialogButtonTrigger = document.getElementById(
        "dialog-button-trigger"
      );
      if (document.hidden && dialogButtonTrigger) {
        if (!isFormSubmitted) {
          dialogButtonTrigger.click();
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

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>
          Are you sure you want to submit?
          {/* Success! */}
          {/* Sorry! */}
        </DialogTitle>
        {/* <DialogDescription>Score: 70%</DialogDescription> */}
      </DialogHeader>

      {/* {score ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ooops!</AlertTitle>
                <AlertDescription>
                  You scored below 80% and can only retake the test after 24
                  hours.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ooops!</AlertTitle>
                <AlertDescription>
                  You scored below 60% and can only retake the test after 24
                  hours.
                </AlertDescription>
              </Alert>
            )} */}

      {/* <p>
              Within the next 24 hours, please review this module thoroughly to
              ensure a deep understanding. Thank you.
            </p> */}
      {/* <Button variant="outline" asChild>
              <Link to="/modules/1" className="flex gap-6">
                <ArrowLeft className="h-6 w-6" /> Javascript functions
              </Link>
            </Button> */}

      {/* <Button variant="outline" asChild>
              <Link to="/modules/checkpoint/1" className="flex gap-6">
                <ArrowLeft className="h-6 w-6" /> Checkpoint
              </Link>
            </Button> */}
      <DialogFooter className="justify-between">
        <DialogClose asChild>
          <Button type="button" variant="destructive">
            No
          </Button>
        </DialogClose>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <FaSpinner className="mr-2 animate-spin" /> : null}
          Yes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
