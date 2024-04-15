import React from "react";
import { Outlet } from "@remix-run/react";
import {
  CalendarCheck,
  CreditCard,
  Home,
  LibrarySquare,
  UserCircle2,
} from "lucide-react";
import { cn } from "~/libs/shadcn";
import { NavBar, SideBar } from "../navigation";
import { Sheet } from "../ui/sheet";

export function AuthAppLayout() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);

  return (
    <Sheet>
      <NavBar
        menuItems={menuItems}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
      />
      <SideBar
        menuItems={menuItems}
        isOpen={isNavOpen}
        setIsOpen={setIsNavOpen}
      />
      <div
        className={cn(
          "duration-300",
          isNavOpen ? "ml-0 lg:ml-52" : "ml-0 lg:ml-16"
        )}
      >
        <Outlet />
      </div>
    </Sheet>
  );
}

const menuItems = [
  {
    icon: <Home size={30} />,
    label: "dashboard",
    href: "dashboard",
  },
  {
    icon: <LibrarySquare size={30} />,
    label: "onboarding",
    href: "onboarding",
  },
  {
    icon: <CreditCard size={30} />,
    label: "subscription",
    href: "subscription",
  },

  {
    icon: <CalendarCheck size={30} />,
    label: "events",
    href: "events",
  },

  {
    icon: <UserCircle2 size={30} />,
    label: "profile",
    href: "profile",
  },
];
