import { useFetcher } from "@remix-run/react";
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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { CgSpinnerTwo } from "react-icons/cg";

export enum INTENT {
  UPDATE_USER = "UPDATE_USER",
  DELETE_USER = "DELETE_USER",
}

export function UserDialog({ user }: { user: User }) {
  const f = useFetcher();
  const isUpdating = f.formData?.get("intent") === INTENT.UPDATE_USER;
  const isDeleting = f.formData?.get("intent") === INTENT.DELETE_USER;
  const isUserSubscribed = user.subscribed ? "premium" : "free";

  return (
    <Dialog>
      <DialogTrigger>
        {isDeleting ? (
          <CgSpinnerTwo size={25} />
        ) : (
          <FaEllipsisVertical size={25} />
        )}
      </DialogTrigger>
      <DialogContent>
        <f.Form method="post" className="flex flex-col gap-4">
          <input type="hidden" name="userId" value={user.id} />
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
            type="text"
            name="githubUsername"
            id="githubUsername"
            placeholder="Github Username"
            defaultValue={user?.githubUsername ?? ""}
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
                  {["USER", "ADMIN"].map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="membership">Membership:</Label>
            <Select defaultValue={isUserSubscribed} name="membership">
              <SelectTrigger>
                <SelectValue placeholder={isUserSubscribed} />
              </SelectTrigger>
              <SelectContent id="membership">
                <SelectGroup>
                  <SelectLabel>Select membership</SelectLabel>
                  {["free", "premium"].map((membership) => (
                    <SelectItem key={membership} value={membership}>
                      {membership}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DeleteUserDialog user={user} />
          <DialogFooter>
            <Button variant="outline" asChild>
              <DialogClose>Close</DialogClose>
            </Button>
            <Button
              name="intent"
              value={INTENT.UPDATE_USER}
              type="submit"
              disabled={isUpdating}
            >
              {isUpdating ? <CgSpinnerTwo size={25} /> : null}
              Update user
            </Button>
          </DialogFooter>
        </f.Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserDialog({ user }: { user: User }) {
  const f = useFetcher();
  const isDeleting = f.formData?.get("intent") === INTENT.DELETE_USER;
  return (
    <AlertDialog>
      <Button variant="destructive" asChild>
        <AlertDialogTrigger className="uppercase">
          delete user
        </AlertDialogTrigger>
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this user?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" asChild>
            <AlertDialogCancel>No</AlertDialogCancel>
          </Button>
          <Button
            onClick={() =>
              f.submit(
                { userId: user.id, intent: INTENT.DELETE_USER },
                { method: "post" }
              )
            }
            disabled={isDeleting}
            asChild
          >
            <AlertDialogCancel>Yes</AlertDialogCancel>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
