import React from "react";
import { useFetcher } from "@remix-run/react";
import { Input } from "../ui/input";
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
import { Textarea } from "../ui/textarea";
import { DialogClose, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { SetValues, Values } from "./event-popover";
import { IoClose } from "react-icons/io5";
import { FaEdit, FaRegSave } from "react-icons/fa";
import { IEvent, IUser, Role } from "~/constants/types";
import { FaPlus } from "react-icons/fa6";
import { CgSpinnerTwo } from "react-icons/cg";

type EventFormProps = {
  event?: IEvent;
  setValues: SetValues;
  values: Values;
  user: IUser;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EventForm({
  setValues,
  values,
  event,
  user,
  isEditing,
  setIsEditing,
}: EventFormProps) {
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.currentTarget;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  const f = useFetcher();

  const isCreating = f.formData?.get("intent") === "addEvent";
  const isUpdating = f.formData?.get("intent") === "updateEvent";

  const handleAddOrUpdateEvent = () => {
    const formattedValues = {
      ...values,
      eventDate:
        typeof values.eventDate === "string"
          ? values.eventDate
          : values.eventDate.toISOString(),
    };

    if (isEditing) {
      if (event) {
        f.submit(
          { intent: "updateEvent", ...formattedValues, eventId: event.id },
          { method: "post" }
        );
      } else {
        f.submit(
          { intent: "addEvent", ...formattedValues },
          { method: "post" }
        );
      }
      if (isEditing) {
        setIsEditing(false);
      }
      setValues({
        title: "",
        description: "",
        type: "",
        eventDate: "",
      });
      window.localStorage.removeItem("event");
    } else {
      setIsEditing(true);
    }
  };

  React.useEffect(() => {
    if (isEditing && event) {
      setValues(event);
    }
  }, [event, isEditing]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <Input
          value={isEditing ? values.title : ""}
          name="title"
          placeholder="title"
          onChange={handleInputChange}
          required
        />
        <div>
          <Label>Type:</Label>
          <Select
            name="type"
            value={isEditing ? values.type : ""}
            required
            onValueChange={(value) =>
              setValues((prev) => ({
                ...prev,
                type: value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Event type</SelectLabel>
                <SelectItem value="workshop">Workshop</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date and Time:</Label>
          <Input
            value={isEditing ? (values.eventDate as string) : ""}
            name="eventDate"
            type="datetime-local"
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label>Description:</Label>
          <Textarea
            value={isEditing ? values.description : ""}
            name="description"
            placeholder="Event description..."
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            required
          />
        </div>
      </div>
      <DialogFooter className="mt-4 gap-4 md:gap-0">
        {isEditing ? (
          <>
            <Button
              onClick={() => {
                setIsEditing(false);
                window.localStorage.removeItem("event");
              }}
            >
              <IoClose className="mr-2" /> Cancel
            </Button>
            <Button
              onClick={handleAddOrUpdateEvent}
              disabled={isUpdating}
              variant="outline"
            >
              {isUpdating ? (
                <CgSpinnerTwo className="mr-2" />
              ) : (
                <FaRegSave className="mr-2" />
              )}
              Save
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" asChild>
              <DialogClose>Close</DialogClose>
            </Button>

            {event ? (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <FaEdit className="mr-2 text-blue-600" /> Edit
              </Button>
            ) : (
              <Button onClick={handleAddOrUpdateEvent} disabled={isCreating}>
                {isCreating ? (
                  <CgSpinnerTwo className="mr-2" />
                ) : (
                  <FaPlus className="mr-2" />
                )}
                Create
              </Button>
            )}
          </>
        )}
      </DialogFooter>
    </>
  );
}
