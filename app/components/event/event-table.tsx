import type { Event, User } from "~/utils/db.server";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { EventPopover } from "./event-popover";

type IEventTableProps = {
  events: Event[];
  user: User;
};

export function EventTable({ events, user }: IEventTableProps) {
  return (
    <Table className="bg-zinc-100 border-2 mt-8">
      <TableCaption>Events</TableCaption>
      <TableHeader className="text-lg">
        <TableRow>
          <TableHead>Title:</TableHead>
          <TableHead>Type:</TableHead>
          <TableHead>Date:</TableHead>
          <TableHead>🤷‍♂️</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events?.length ? (
          events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{capitalizeFirstLetter(event.title)}</TableCell>
              <TableCell>
                <Badge>{event.type}</Badge>
              </TableCell>
              <TableCell className="text-blue-600">
                {format(new Date(event.eventDate), "do MMM, yyyy - HH:MMp")}
              </TableCell>
              <TableCell className="text-blue-600">
                <EventPopover event={event} user={user} />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4}>
              <p className="text-slate-600 text-center">
                Added events will appear here.
              </p>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
