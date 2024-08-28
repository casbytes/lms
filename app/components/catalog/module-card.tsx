import React from "react";
import { Card, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { FaStar } from "react-icons/fa6";
import { MetaModule } from "~/services/sanity/types";

export function ModuleCard({
  module,
  cardActionButton,
}: {
  module?: MetaModule;
  cardActionButton: React.ReactNode;
}) {
  return (
    <Card
      aria-label={module?.title}
      className="shadow-xl text-center mx-auto bg-white/95"
    >
      <CardHeader className="items-center flex flex-col relative">
        <h2 className="text-blue-700 capitalize font-black text-sm font-mono">
          {module?.title}
        </h2>
        {cardActionButton}
        <Badge className="absolute rounded-bl-none rounded-tr-none -top-[0.4rem] left-0 bg-white text-sky-600 hover:bg-white">
          {module?.premium ? "premium" : "free"}
        </Badge>
        <Badge className="absolute rounded-bl-none rounded-tr-none bottom-0 right-0">
          <FaStar className="mr-2" />
          4.5
        </Badge>
      </CardHeader>
    </Card>
  );
}
