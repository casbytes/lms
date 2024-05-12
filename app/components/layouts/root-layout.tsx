import { Outlet, useNavigation } from "@remix-run/react";
import { Toaster } from "../ui/toaster";

export function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
