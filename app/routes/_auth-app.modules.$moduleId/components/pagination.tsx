import { useFetcher } from "@remix-run/react";
import React from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { Button } from "~/components/ui/button";

export default function Pagination() {
  const pagination = useFetcher();

  return (
    <pagination.Form
      method="post"
      className="flex flex-col gap-4 md:flex-row justify-between"
    >
      <Button
        variant="outline"
        name="next-lesson"
        value="lesson-name"
        aria-label=""
        className="flex items-center"
      >
        <>
          <RiArrowLeftSLine className="inline h-6 w-6" /> some previous
        </>
      </Button>

      <Button
        variant="outline"
        name="next-lesson"
        value="lesson-name"
        aria-label=""
        className="flex items-center"
      >
        <>
          some next <RiArrowRightSLine className="inline h-6 w-6" />
        </>
      </Button>
    </pagination.Form>
  );
}
