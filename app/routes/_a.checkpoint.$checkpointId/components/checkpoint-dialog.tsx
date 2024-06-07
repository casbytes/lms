import React from "react";
import { useNavigation } from "@remix-run/react";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "~/components/ui/dialog";
import { CheckpointForm } from "./checkpoint-form";
import { LinkList } from "./link-list";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { FaSpinner } from "react-icons/fa6";

type CheckpointDialogProps = {
  links: string[];
  handleSubmit: () => void;
  setLinks: React.Dispatch<React.SetStateAction<string[]>>;
};

export function CheckpointDialog({
  links,
  setLinks,
  handleSubmit,
}: CheckpointDialogProps) {
  function deleteLink(index: number) {
    setLinks((prevLinks) => {
      const newLinks = prevLinks.filter((_, i) => i !== index);
      return newLinks;
    });
  }

  const navigation = useNavigation();

  const isSubmitting = navigation.formData?.get("intent") === "submit";

  return (
    <DialogContent>
      <DialogHeader className="flex flex-col gap-4">
        <DialogTitle className="text-lg">Add submission.</DialogTitle>
        <CheckpointForm setLinks={setLinks} />
        <Separator />
        <LinkList links={links} deleteLink={deleteLink} />
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="destructive">Close</Button>
        </DialogClose>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <FaSpinner className="mr-4" /> : null}
          Submit
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
