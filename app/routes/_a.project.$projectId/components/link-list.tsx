import { Link } from "@remix-run/react";
import React from "react";
import { MdDelete } from "react-icons/md";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

type LinkListProps = {
  links: string[];
  deleteLink: (index: number) => void;
};

export function LinkList({ links, deleteLink }: LinkListProps) {
  return (
    <ul className="space-y-2 list-disc w-full">
      {links?.length
        ? links.map((link, index) => (
            <React.Fragment key={`${link}-${index}`}>
              <li className="flex justify-between items-center">
                <Link target="_blank" className="text-blue-600" to={link}>
                  {link}
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => deleteLink(index)}
                  className="p-1"
                >
                  <MdDelete size={25} className="text-red-600" />
                </Button>
              </li>
              {index < links.length - 1 ? <Separator /> : null}
            </React.Fragment>
          ))
        : null}
    </ul>
  );
}
