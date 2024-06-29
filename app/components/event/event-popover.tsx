import React from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { IEvent, IUser } from "~/constants/types";
import { EventDialog } from "./event-dialog";
import { Button } from "../ui/button";
import { MdOutlineDeleteForever } from "react-icons/md";
import { Separator } from "../ui/separator";
import { AddEventDialog } from "./add-event-dialog";

export type Values = {
  title: string;
  description: string;
  type: string;
  eventDate: Date | string;
};

export type SetValues = React.Dispatch<React.SetStateAction<Values>>;

export function EventPopover({ event, user }: { event: IEvent; user: IUser }) {
  return (
    <Popover>
      <PopoverTrigger>
        <HiOutlineDotsVertical size={25} />
      </PopoverTrigger>
      <PopoverContent className="max-w-32 flex flex-col gap-2">
        <EventDialog event={event} user={user} />
        <Separator />
        <AddEventDialog user={user} />
        <Separator />
        <Button variant="secondary" className="w-full">
          <MdOutlineDeleteForever size={25} className="mr-2" /> Delete
        </Button>
      </PopoverContent>
    </Popover>
  );
}
