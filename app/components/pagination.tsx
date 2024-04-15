import { Link, Form, useFetcher } from "@remix-run/react";
import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";
import { MarkAsCompletedButton } from "./mark-as-completed-button";
import { Button } from "./ui/button";

type PaginationProps = {
  action: string;
  nextTo: string;
  previousTo: string;
  markAsCompletedTo: string;
  previousItem?: string;
  nextItem?: string;
  previousItemOnClick?: () => void;
  nextItemOnClick?: () => void;
  markAsCompletedOnClick?: () => void;
  markAsCompletedDisabled?: boolean;
  previousItemDisabled?: boolean;
  nextItemDisabled?: boolean;
};

export function Pagination({
  action,
  nextTo,
  previousTo,
  markAsCompletedTo,
  previousItem = "",
  nextItem = "",
  previousItemOnClick,
  nextItemOnClick,
  markAsCompletedOnClick,
  markAsCompletedDisabled,
  previousItemDisabled,
  nextItemDisabled,
}: PaginationProps) {
  const pagination = useFetcher();
  return (
    <pagination.Form
      method="post"
      action={action}
      className="flex flex-col gap-4 md:flex-row justify-between"
    >
      <Button
        variant="outline"
        onClick={previousItemOnClick}
        disabled={previousItemDisabled}
        aria-label={previousItem}
        asChild
        className="flex items-center"
      >
        <div>
          <RiArrowLeftSLine className="inline h-6 w-6" /> {previousItem}
        </div>
      </Button>
      <MarkAsCompletedButton
        onClick={markAsCompletedOnClick}
        disabled={markAsCompletedDisabled}
      />
      <Button
        variant="outline"
        onClick={nextItemOnClick}
        disabled={nextItemDisabled}
        aria-label={nextItem}
        asChild
        className="flex items-center"
      >
        <div>
          {nextItem} <RiArrowRightSLine className="inline h-6 w-6" />
        </div>
      </Button>
    </pagination.Form>
  );
}
