import React from "react";
import { Form } from "@remix-run/react";
import { FaEllipsisVertical } from "react-icons/fa6";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { User } from "~/utils/db.server";

export function UserDialog({ user }: { user: User }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  return (
    <Dialog>
      <DialogTrigger>
        <FaEllipsisVertical size={25} />
      </DialogTrigger>
      <DialogContent>
        <Form method="post" ref={formRef} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{user.name}</DialogTitle>
            <DialogDescription>
              {user.email} - <Badge>{user.role}</Badge>
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            defaultValue={user.name!}
          />
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            defaultValue={user.email}
          />
          <div>
            <Label htmlFor="role">Role:</Label>
            <Select defaultValue={user.role} name="role">
              <SelectTrigger>
                <SelectValue placeholder={user.role} />
              </SelectTrigger>
              <SelectContent id="role">
                <SelectGroup>
                  <SelectLabel>Select role</SelectLabel>
                  {["USER", "ADMIN", "MODERATOR", "MENTOR"].map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" asChild>
              <DialogClose>Close</DialogClose>
            </Button>
            <Dialog>
              <DialogTrigger>
                <Button type="button">Update</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>
                  Are you sure you want to update this user?
                </DialogTitle>
                <DialogFooter>
                  <Button variant="outline" asChild>
                    <DialogClose>No</DialogClose>
                  </Button>
                  <Button onClick={() => formRef.current?.submit()}>Yes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
