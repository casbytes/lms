import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { MdOutlineAddLink } from "react-icons/md";
import { Form, useNavigation } from "@remix-run/react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { CgSpinnerTwo } from "react-icons/cg";
import type { TaskProps } from ".";

export function AddLinkDialog({ task }: { task: TaskProps }) {
  const [isDisabled, setIsDisabled] = React.useState(true);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const n = useNavigation();
  const isSubmitting = n.formData?.get("intent") === "addLink";

  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  function handleInputChange() {
    if (inputRef.current) {
      const inputValue = inputRef.current.value;
      const inputLength = inputValue.length;
      const isUrlValid = isValidUrl(inputValue);
      if (!inputLength || !isUrlValid) {
        setIsDisabled(true);
      } else {
        setIsDisabled(false);
      }
    }
  }

  return (
    <Dialog>
      <Button
        type="button"
        className="w-full capitalize"
        variant="secondary"
        asChild
      >
        <DialogTrigger>
          <MdOutlineAddLink className="mr-2" size={25} />
          add link
        </DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
        </DialogHeader>
        <Form method="post" className="flex flex-col gap-6">
          <input type="hidden" name="taskId" value={task.id} />
          <div>
            <Label>Type:</Label>
            <Select name="linkType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select link type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Type</SelectLabel>
                  <SelectItem value="Google Doc.">Google Doc.</SelectItem>
                  <SelectItem value="GitHub Repo.">Github Repo.</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Input
            ref={inputRef}
            onChange={handleInputChange}
            name="url"
            placeholder="URL"
          />
          <DialogFooter className="gap-4 md:gap-0">
            <Button variant="destructive" asChild>
              <DialogClose>Close</DialogClose>
            </Button>
            <Button
              name="intent"
              value="addLink"
              type="submit"
              disabled={isDisabled}
            >
              {isSubmitting ? (
                <CgSpinnerTwo size={15} className="mr-2 animate-spin" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
