import React from "react";
import {
  Outlet,
  useFetcher,
  useMatches,
  useNavigation,
} from "@remix-run/react";
import { useInterval } from "use-interval";
import { Toaster } from "../ui/toaster";
import { Sheet } from "../ui/sheet";
import { cn } from "~/libs/shadcn";
import { NavBar, SideBar } from "../navigation";
import { adminMenuItems, userMenuItems, unAuthMenuItems } from ".";
import { FullPagePendingUI } from "../full-page-pending-ui";
import { useLearningTimer } from "~/utils/hooks";
import { BackToTopButton } from "../back-to-top-button";
import { AuthDialogProvider } from "~/contexts/auth-dialog-context";

export function RootLayout() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const { startTimer, elapsedTime, stopTimer, isRunning } = useLearningTimer();

  const n = useNavigation();
  const f = useFetcher();
  const matches = useMatches();

  const isLoading = n.state === "loading";

  const user = matches.some(
    (match) =>
      match.id === "routes/_a" && !match.id.includes("routes/_a._admin.a")
  );
  const admin = matches.some((match) =>
    match.id.includes("routes/_a._admin.a")
  );

  const resourceRoutes = matches.some(
    (match) =>
      match.id.includes("signout") ||
      match.id.includes("google") ||
      match.id.includes("github") ||
      match.id.includes("healthcheck")
  );

  const isAuth = (user || admin) && !resourceRoutes;
  const menuItems = admin
    ? adminMenuItems
    : user
    ? userMenuItems
    : unAuthMenuItems;

  const logLearningTime = React.useCallback(() => {
    if (elapsedTime > 0) {
      f.submit(
        { hours: elapsedTime, intent: "log" },
        { method: "POST", action: "/logger" }
      );
    }
  }, [elapsedTime, f]);

  // const LOG_INTERVAL = 60000; // 1 minute
  // useInterval(() => {
  //   if (user) {
  //     logLearningTime();
  //   }
  // }, LOG_INTERVAL);


  /**
   * If the navigation is taking too long (> 1 second), we show a full page pending UI
   * to the user.
   */
  const START_NAVIGATION_TIME = 1000;
  React.useEffect(() => {
    let timeout: number | undefined;
    if (isLoading) {
      timeout = window.setTimeout(() => {
        setIsNavigating(true);
      }, START_NAVIGATION_TIME);
    } else {
      if (timeout) {
        clearTimeout(timeout);
      }
      setIsNavigating(false);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isLoading]);

  

  const sideBarClassnames = cn(
    "duration-300 bg-slate-100 min-h-screen",
    isOpen ? (isAuth ? "lg:ml-56" : "") : isAuth ? "lg:ml-16" : "",
    {
      "cursor-wait": isLoading,
    }
  );

  return (
    <AuthDialogProvider>
      <Sheet>
        <NavBar
          menuItems={menuItems}
          isNavOpen={isOpen}
          setIsNavOpen={setIsOpen}
        />
        {isAuth ? (
          <SideBar
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            menuItems={menuItems}
          />
        ) : null}
        <div className={sideBarClassnames}>
          <Toaster />
          {isNavigating ? <FullPagePendingUI /> : null}
          <Outlet />
          <BackToTopButton />
        </div>
      </Sheet>
    </AuthDialogProvider>
  ) 
}
