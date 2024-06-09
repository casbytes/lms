import React from "react";
import {
  useBlocker,
  useNavigation,
  useNavigate,
  redirect,
} from "@remix-run/react";
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

type TestDialogProps = {
  submitForm: () => Promise<void>;
  isFormSubmitted: boolean;
  dialogButtonRef: ReturnType<typeof React.useRef>;
};

export function TestDialog({
  submitForm,
  dialogButtonRef,
  isFormSubmitted,
}: TestDialogProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();

  const isSubmitting = navigation.formData?.get("intent") === "submit";

  async function handleButtonClick() {
    await submitForm();
    navigate(-2);
  }

  /**
   * useEffect to handle window or tab change
   */
  React.useEffect(() => {
    async function handleTabChange() {
      if (document.hidden && dialogButtonRef.current) {
        if (!isFormSubmitted) {
          (dialogButtonRef.current as HTMLButtonElement).click();
          await handleButtonClick();
        }
      }
    }

    document.addEventListener("visibilitychange", handleTabChange);
    return () => {
      document.removeEventListener("visibilitychange", handleTabChange);
    };
  }, [isFormSubmitted, navigate]);

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Are you sure you want to leave this page?</DialogTitle>
      </DialogHeader>

      <DialogFooter className="justify-between gap-4">
        <DialogClose asChild>
          <Button
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
