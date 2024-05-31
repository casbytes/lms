import React from "react";
import { Outlet, useMatches } from "@remix-run/react";
import { Toaster } from "../ui/toaster";
import { Dialog } from "../ui/dialog";
import { Sheet } from "../ui/sheet";
import { cn } from "~/libs/shadcn";
import { NavBar, SideBar } from "../navigation";
import { authMenuItems, unAuthMenuItems } from ".";

export function RootLayout() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);

  const matches = useMatches();
  const auth = matches.some((match) => match.id.includes("_a"));
  const resourceRoutes = matches.some(
    (match) =>
      match.id.includes("signout") ||
      match.id.includes("google") ||
      match.id.includes("github") ||
      match.id.includes("healthcheck")
  );
  const menuItems = auth ? authMenuItems : unAuthMenuItems;
  return (
    <Dialog>
      <Sheet>
        <NavBar
          menuItems={menuItems}
          isNavOpen={isNavOpen}
          setIsNavOpen={setIsNavOpen}
        />
        {auth && !resourceRoutes ? (
          <SideBar
            menuItems={authMenuItems}
            isOpen={isNavOpen}
            setIsOpen={setIsNavOpen}
          />
        ) : null}
        <div
          className={cn(
            "duration-300",
            isNavOpen
              ? auth && !resourceRoutes
                ? "ml-0 lg:ml-52"
                : ""
              : auth && !resourceRoutes
              ? "ml-0 lg:ml-16"
              : ""
          )}
        >
          <Outlet />
        </div>
        <Toaster />
      </Sheet>
    </Dialog>
  );
}
