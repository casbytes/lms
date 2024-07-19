import type { Badge as IBadge, ModuleProgress } from "~/utils/db.server";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "~/libs/shadcn";
import { Badge } from "../ui/badge";
import { capitalizeFirstLetter } from "~/utils/helpers";
import { BadgeStatus } from "~/constants/enums";

type BadgeWithModuleProgress = IBadge & {
  moduleProgress?: ModuleProgress;
};

type BadgeGalleryProps = {
  badges: BadgeWithModuleProgress[];
};

export function BadgeGallery({ badges }: BadgeGalleryProps) {
  return (
    <>
      <p className="mx-4 text-sm opacity-80">
        Unlock badges as you progress through the module.
      </p>
      <ul className="flex justify-evenly flex-wrap gap-4 p-2 mb-2">
        {badges.map((badge) => {
          const LOCKED = badge.status === BadgeStatus.LOCKED;
          const UNLOCKED = badge.status === BadgeStatus.UNLOCKED;

          return (
            <Popover key={badge.id}>
              <PopoverTrigger>
                <li
                  key={badge.id}
                  className="flex flex-col items-center text-lg relative"
                >
                  <img
                    src={`https://cdn.casbytes.com/badges/${
                      UNLOCKED
                        ? badge.title + "_unlocked"
                        : badge.title + "_locked"
                    }.png`}
                    className="w-16 h-16"
                    alt={badge.title}
                  />

                  <span className="uppercase text-sm">{badge.status}</span>
                </li>
              </PopoverTrigger>
              <PopoverContent
                className={cn("px-6 py-4 mx-auto bg-slate-200 relative", {
                  "bg-sky-200": UNLOCKED,
                })}
              >
                <Badge
                  className={cn("top-1 left-1 uppercase absolute", {
                    "bg-slate-500 hover:bg-slate-400": LOCKED,
                  })}
                >
                  {badge.title}
                </Badge>
                <img
                  src={`https://cdn.casbytes.com/badges/${
                    UNLOCKED
                      ? badge.title + "_unlocked"
                      : badge.title + "_locked"
                  }.png`}
                  className="w-24 h-24 mx-auto"
                  alt={badge.title}
                />
                <Badge
                  className={cn("block text-md mt-2", {
                    "bg-slate-500 hover:bg-slate-400": LOCKED,
                  })}
                >
                  {capitalizeFirstLetter(badge.moduleProgress!.title)}{" "}
                  {badge.title}
                </Badge>
                <p className="mt-4">
                  {UNLOCKED
                    ? badge.unlocked_description
                    : badge.locked_description}
                </p>
              </PopoverContent>
            </Popover>
          );
        })}
      </ul>
    </>
  );
}
