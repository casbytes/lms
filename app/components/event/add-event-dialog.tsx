import type { User } from "~/utils/db.server";
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

export function AddEventDialog({ user }: { user: User }) {
  const [values, setValues] = useLocalStorageState<Values>("addEvent", {
    title: "",
    description: "",
    type: "",
    eventDate: "",
  });

  return (
    <Dialog>
      <Button
        size="icon"
        className="w-full fixed bottom-5 right-5 md:bottom-10 md:right-10 drop-shadow-2xl"
        asChild
      >
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
