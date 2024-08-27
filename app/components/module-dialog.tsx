import React from "react";
import { MetaModule } from "~/services/sanity/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { Badge } from "./ui/badge";
import { FaStar } from "react-icons/fa6";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Card, CardHeader } from "./ui/card";

export default function ModuleDialog({
  module,
  dialogButton,
  cardButton,
}: {
  module: MetaModule;
  dialogButton?: React.ReactNode;
  cardButton: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{capitalizeFirstLetter(module.title)}</DialogTitle>
          <DialogDescription>
            {/* {module.description} */}
            <p className="mt-2 font-mono text-xs font-extrabold">
              Sign in to complete your onboarding journey and start learning.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between w-full">
              <Badge>{module.premium ? "Premium" : "free"}</Badge>{" "}
              <Badge>
                <FaStar /> <Separator orientation="vertical" className="mx-2" />{" "}
                4.5
              </Badge>
            </div>
            <Button asChild className="self-end">
              <DialogClose>Close</DialogClose>
            </Button>
            {dialogButton ? dialogButton : null}
          </div>
        </DialogFooter>
      </DialogContent>
      <Card
        aria-label={module.title}
        className="shadow-xl text-center mx-auto bg-white/95 p-2"
      >
        <CardHeader className="items-center flex flex-col relative">
          <h2 className="text-blue-700 capitalize font-black text-sm font-mono">
            {module.title}
          </h2>
          {cardButton}
          <Badge className="absolute rounded-bl-none rounded-tr-none -top-[0.4rem] left-0 bg-white text-sky-600 hover:bg-white">
            {module.premium ? "premium" : "free"}
          </Badge>
          <Badge className="absolute rounded-bl-none rounded-tr-none bottom-0 right-0">
            <FaStar className="mr-2" />
            4.5
          </Badge>
        </CardHeader>
      </Card>
    </Dialog>
  );
}
