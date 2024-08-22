/* eslint-disable react/prop-types */
import { cn } from "~/libs/shadcn";
import { useSideBar } from "./side-bar-context";

export function SideBarContainer({ ...props }) {
  const { isOpen } = useSideBar();
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 hidden lg:block z-50  h-screen bg-slate-800 text-slate-100  duration-300 ease-in-out",
        isOpen ? "w-52" : "w-16"
      )}
    >
      {props.children}
    </nav>
  );
}
