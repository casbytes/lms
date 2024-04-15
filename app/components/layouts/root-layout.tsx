import { Outlet, useNavigation } from "@remix-run/react";
import { Toaster } from "../ui/toaster";
import { FullPagePendingUI } from "../full-page-pending-ui";

export function RootLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  return (
    <>
      {/* {isLoading ? <FullPagePendingUI /> : <Outlet />} */}
      <Outlet />
      <Toaster />
    </>
  );
}
