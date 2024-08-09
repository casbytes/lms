import React from "react";
import { useNavigation } from "@remix-run/react";
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
  submitTest: () => void;
};

export function TestDialog({ submitTest }: TestDialogProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.formData?.get("intent") === "submit";

  React.useEffect(() => {
    const handleTabChange = () => {
      if (document.hidden) {
        submitTest();
      }
    };

    document.addEventListener("visibilitychange", handleTabChange);
    return () => {
      document.removeEventListener("visibilitychange", handleTabChange);
    };
  }, [submitTest]);

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Are you sure you want to submit your test?</DialogTitle>
      </DialogHeader>

      <DialogFooter className="justify-between gap-4">
        <DialogClose asChild>
          <Button type="button" variant="destructive" disabled={isSubmitting}>
            No
          </Button>
        </DialogClose>
        <Button type="button" onClick={submitTest} disabled={isSubmitting}>
          {isSubmitting ? <FaSpinner className="mr-2 animate-spin" /> : null}
          Yes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
