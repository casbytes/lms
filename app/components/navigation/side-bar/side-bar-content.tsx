import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Link } from "@remix-run/react";
import { cn } from "~/libs/shadcn";
import { useSideBar } from "./side-bar-context";
import { SignOutButton } from "~/components/signout-form";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export function SideBarContent({ ...props }) {
  const { isOpen, toggleSideBar } = useSideBar();
  return (
    <>
      <div className="flex-col flex h-32 justify-between items-center gap-4 p-4 bg-gray-300">
        <Link to="/dashboard">
          <img
            src={`https://cdn.casbytes.com/assets/${
              isOpen ? "logo.png" : "icon.png"
            }`}
            alt="CASBytes"
            width={isOpen ? 150 : 40}
            className={cn(isOpen ? "w-[150px]" : "w-[40px]")}
          />
        </Link>
        <Button
          variant="ghost"
          onClick={toggleSideBar}
          className={cn("p-1 hover:opacity-80", isOpen && "self-end")}
          aria-label={isOpen ? "close sidebar" : "open sidebar"}
        >
          {isOpen ? (
            <ChevronLeft size={35} className="text-red-500" />
          ) : (
            <ChevronRight size={35} className="text-black" />
          )}
        </Button>
      </div>
      <hr />
      <div
        className={cn("flex flex-col items-start gap-6 py-6 overflow-y-auto")}
      >
        {props.children}
        <Separator />
        <SignOutButton
          icon={
            <LogOut
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
