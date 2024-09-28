import React from "react";
import { cn } from "~/libs/shadcn";
import { SideBarContent } from "./content";

export interface MenuItem {
  icon?: React.ReactNode;
  label: string;
  href: string;
  target?: string;
}

type SideBarProps = {
  menuItems: MenuItem[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function SideBar({ menuItems, isOpen, setIsOpen }: SideBarProps) {
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 hidden lg:block z-50  h-screen bg-slate-800 text-slate-100  duration-300 ease-in-out",
        isOpen ? "w-56" : "w-16"
      )}
    >
      <SideBarContent
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        menuItems={menuItems}
      />
    </nav>
  );
}
