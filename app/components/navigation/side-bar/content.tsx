import { Link } from "@remix-run/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import { cn } from "~/libs/shadcn";
import { SignOutButton } from "~/components/signout-form";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Image } from "~/components/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { MenuItem } from ".";

type SideBarContentProps = {
  menuItems: MenuItem[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function SideBarContent({
  menuItems,
  isOpen,
  setIsOpen,
}: SideBarContentProps) {
  return (
    <>
      <div className="flex-col flex h-32 justify-between items-center gap-4 p-4 bg-gray-300">
        <Link prefetch="intent" to="/dashboard">
          <Image
            src={`assets/${isOpen ? "logo.png" : "icon.png"}`}
            alt="CASBytes"
            width={isOpen ? 150 : 40}
            className={cn(isOpen ? "w-[150px]" : "w-[40px]")}
          />
        </Link>
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className={cn("p-1 hover:opacity-80", isOpen && "self-end")}
          aria-label={isOpen ? "close sidebar" : "open sidebar"}
        >
          {isOpen ? (
            <FaChevronLeft size={35} className="text-red-500" />
          ) : (
            <FaChevronRight size={35} className="text-black" />
          )}
        </Button>
      </div>
      <hr />
      <div
        className={cn("flex flex-col items-start gap-6 py-6 overflow-y-auto")}
      >
        <TooltipProvider>
          {menuItems.map((item, index) => (
            <Tooltip key={`item-${index}`}>
              <TooltipContent className="text-lg">{item.label}</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  className="text-slate-200 hover:text-white"
                  asChild
                >
                  <Link
                    prefetch="intent"
                    to={item.href}
                    target={item.target ?? "_self"}
                    className="flex gap-4 capitalize text-xl items-center"
                  >
                    {item.icon}
                    {isOpen && item.label}
                  </Link>
                </Button>
              </TooltipTrigger>
            </Tooltip>
          ))}
        </TooltipProvider>
        <Separator />
        <SignOutButton
          icon={
            <FiLogOut
              size={30}
              className="text-red-500 hover:opacity-70 duration-300"
            />
          }
          isOpen={isOpen}
        />
      </div>
    </>
  );
}
