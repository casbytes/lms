import { Link, useNavigation, useSubmit } from "@remix-run/react";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaPlus } from "react-icons/fa6";
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
import type {
  GithubModule as IGithubModule,
  GithubCourse as IGithubCourse,
} from "../utils.server";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { User } from "~/utils/db.server";

interface GithubModule extends IGithubModule {
  type: string;
}

interface GithubCourse extends IGithubCourse {
  type: string;
}

export function ConfirmationDialog({
  item,
  user,
  inCatalog,
}: {
  user?: User;
  item: GithubCourse | GithubModule;
  inCatalog: boolean;
}) {
  const n = useNavigation();
  const isSubscribed = user?.subscribed;
  const notSubscribed = !inCatalog && !isSubscribed && item.type === "module";
  const isSubmitting = n.formData?.get("intent") === "addGithubCourseToCatalog";

  return (
    <Dialog>
      <Trigger isSubmitting={isSubmitting} />
      <DialogContent>
        {inCatalog ? (
          <NotifyInCatalog />
        ) : notSubscribed ? (
          <NotifySubscription />
        ) : (
          <Confirm
            item={item}
            inCatalog={inCatalog}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Trigger({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    // <Button className="bg-indigo-500 hover:bg-indigo-400 !py-0 p-0" asChild>
    <DialogTrigger
      disabled={isSubmitting}
      className="disabled:bg-slate-200 text-blue-600 disabled:cursor-not-allowed"
    >
      {" "}
      {isSubmitting ? (
        <CgSpinnerTwo className="animate-spin" />
      ) : (
        <FaPlus size={15} />
      )}
    </DialogTrigger>
    // </Button>
  );
}

function NotifyInCatalog() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          You can&apos;t add a new course or module to your catalog.
        </DialogTitle>
        <DialogDescription>
          You have an ongoing course or module in your catalog, please complete
          it before adding another one.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant={"outline"} asChild>
          <DialogClose>Close</DialogClose>
        </Button>
      </DialogFooter>
    </>
  );
}
function NotifySubscription() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          You must be subscribed to add this module to your catalog.
        </DialogTitle>
      </DialogHeader>
      <DialogFooter>
        <Button variant={"outline"} asChild>
          <DialogClose>Close</DialogClose>
        </Button>
        <Button asChild>
          <Link to="/subscription">Subscribe</Link>
        </Button>
      </DialogFooter>
    </>
  );
}
function Confirm({
  item,
  inCatalog,
  isSubmitting,
}: {
  item: GithubCourse | GithubModule;
  inCatalog: boolean;
  isSubmitting: boolean;
}) {
  const submit = useSubmit();
  const submitOptions = {
    intent:
      item.type === "course" ? "addCourseToCatalog" : "addModuleToCatalog",
    itemId: item.id,
  };
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          Are you sure you want to add this {item.type} to your catalog?
        </DialogTitle>
        <DialogDescription className="text-lg">
          {capitalizeFirstLetter(item.title)}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant={"outline"} asChild>
          <DialogClose>Cancel</DialogClose>
        </Button>
        <Button
          size={"sm"}
          className="bg-indigo-500 hover:bg-indigo-400 py-1 font-black"
          disabled={isSubmitting || inCatalog}
          onClick={() => {
            submit(submitOptions, { method: "POST" });
          }}
          asChild
        >
          <DialogClose>Confirm</DialogClose>
        </Button>
      </DialogFooter>
    </>
  );
}
