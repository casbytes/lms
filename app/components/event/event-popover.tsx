import React from "react";
import type { Event, User } from "~/utils/db.server";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { EventDialog } from "./event-dialog";
import { Button } from "../ui/button";
import { MdOutlineDeleteForever } from "react-icons/md";
import { Separator } from "../ui/separator";

export type Values = {
  title: string;
  description: string;
  type: string;
  eventDate: Date | string;
};

export type SetValues = React.Dispatch<React.SetStateAction<Values>>;

export function EventPopover({ event, user }: { event: Event; user: User }) {
  return (
    <Popover>
      <PopoverTrigger>
        <HiOutlineDotsVertical size={25} />
      </PopoverTrigger>
      <PopoverContent className="max-w-32 flex flex-col gap-2">
        <EventDialog event={event} user={user} />
        {user.role === "ADMIN" || user.role === "MODERATOR" ? (
          <>
            <Separator />
            <Button variant="secondary" className="w-full">
              <MdOutlineDeleteForever size={25} className="mr-2" /> Delete
            </Button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
