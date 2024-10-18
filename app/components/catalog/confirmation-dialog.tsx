import { Link, useNavigation, useSubmit } from "@remix-run/react";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaArrowRight, FaPlus } from "react-icons/fa6";
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
import { capitalizeFirstLetter } from "~/utils/helpers";
import { MetaCourse, MetaModule } from "~/services/sanity/types";
import { CurrentItem } from "~/utils/helpers.server";

export function ConfirmationDialog({
  user,
  module,
  course,
  currentItem,
}: {
  user: { subscribed: boolean } | null;
  module?: MetaModule;
  course?: MetaCourse;
  currentItem: CurrentItem;
}) {
  const n = useNavigation();
  const item = module ?? (course as MetaCourse);
  const isSubscribed = user?.subscribed;
  const notSubscribed = !currentItem && !isSubscribed && item.premium;
  const isSubmitting = n.formData?.get("intent") === "addGithubCourseToCatalog";

  return (
    <Dialog>
      <Trigger
      course={course}
      module={module}
        currentItem={currentItem}
        isSubmitting={isSubmitting}
      />
      <DialogContent>
        {currentItem ? (
          <NotifyInCatalog />
        ) : notSubscribed ? (
          <NotifySubscription />
        ) : (
          <Confirm
            module={module}
            course={course}
            currentItem={currentItem}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Trigger({
  course,
  module,
  isSubmitting,
  currentItem,
}: {
  course?: MetaCourse;
  module?: MetaModule;
  isSubmitting: boolean;
  currentItem: CurrentItem;
}) {
  const item = course ?? module;
  const isCurrent = currentItem?.title === item?.title;
  return (
    <Button asChild>
      {isCurrent?(
        <Link
        prefetch="intent"
          to={course ? `/courses/${currentItem?.id}` : `/modules/${currentItem?.id}`}
          className="uppercase font-mono flex items-center"
        >
          {item?.title} <FaArrowRight size={18} className="ml-4" />
        </Link>
      ) : (
        <DialogTrigger
      >
        {isSubmitting ? (
          <CgSpinnerTwo className="animate-spin" />
        ) : (
          <>
            <FaPlus size={15} className="mr-2" /> ADD TO CATALOG
          </>
        )}
        </DialogTrigger>
      )}
    </Button>
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
  module,
  course,
  currentItem,
  isSubmitting,
}: {
  module?: MetaModule;
  course?: MetaCourse;
  currentItem: { title: string } | null;
  isSubmitting: boolean;
}) {
  const submit = useSubmit();

  const item = module ?? (course as MetaCourse);
  const submitOptions = {
    intent: course ? "addCourseToCatalog" : "addModuleToCatalog",
    itemId: item.id,
  };

  const isCurrent = currentItem?.title === item.title;
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          Are you sure you want to add{" "}
          <span className="text-sky-700">{item.title}</span> to your catalog ?
        </DialogTitle>
        <DialogDescription className="text-lg">
          {course ? "Course" : "Module"}:{" "}
          <span className="font-mono text-black">
            {capitalizeFirstLetter(item.title)}
          </span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant={"outline"} asChild>
          <DialogClose>Cancel</DialogClose>
        </Button>
        <Button
          className="bg-indigo-500 hover:bg-indigo-400 py-1 font-black"
          disabled={isSubmitting || isCurrent}
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
