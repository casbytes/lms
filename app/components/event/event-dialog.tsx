import React from "react";
import { types } from "~/utils/db.server";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { FaEye } from "react-icons/fa6";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { FaEdit } from "react-icons/fa";
import { Values } from "./event-popover";
import { EventForm } from "./event-form";
import { useLocalStorageState } from "~/utils/hooks";
import { Role } from "~/constants/enums";

type EventDialogProps = {
  event: types.Event;
  user: types.User;
};

export function EventDialog({ event, user }: EventDialogProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [values, setValues] = useLocalStorageState<Values>("event", event);

  return (
    <Dialog>
      <Button variant="secondary" size="icon" className="w-full" asChild>
        <DialogTrigger className="max-w-24">
          <FaEye className="mr-2" /> View
        </DialogTrigger>
      </Button>

      <DialogContent>
        {isEditing ? (
          <EventForm
            user={user}
            values={values}
            setValues={setValues}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        ) : (
          <DialogHeader>
            <DialogTitle>{capitalizeFirstLetter(event.title)}</DialogTitle>
            <DialogDescription>{event.description}</DialogDescription>
          </DialogHeader>
        )}
        <DialogFooter>
          {isEditing ? null : (
            <>
              <Button asChild>
                <DialogClose>Close</DialogClose>
              </Button>
              {user.role !== (Role.ADMIN || Role.MODERATOR) ? null : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="secondary"
                  className="mr-2"
                >
                  <FaEdit className="mr-2 text-blue-600" /> Edit
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
