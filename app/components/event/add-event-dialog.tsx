import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { FaPlus } from "react-icons/fa6";
import { Values } from "./event-popover";
import { EventForm } from "./event-form";
import { useLocalStorageState } from "~/utils/hooks";
import { IUser } from "~/constants/types";

export function AddEventDialog({ user }: { user: IUser }) {
  const [values, setValues] = useLocalStorageState<Values>("event", {
    title: "",
    description: "",
    type: "",
    eventDate: "",
  });

  return (
    <Dialog>
      <Button variant="secondary" size="icon" className="w-full" asChild>
        <DialogTrigger className="max-w-24">
          <FaPlus className="mr-2" /> Add
        </DialogTrigger>
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>
        <EventForm
          user={user}
          values={values}
          setValues={setValues}
          setIsEditing={() => {}}
          isEditing={false}
        />
      </DialogContent>
    </Dialog>
  );
}
