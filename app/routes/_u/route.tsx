import { Outlet } from "@remix-run/react";
import { Footer } from "~/components/footer";
import { AuthDialog } from "./components/auth-dialog";

export default function UnAuthApp() {
  return (
    <>
      <Outlet />
      <AuthDialog />
      <Footer />
    </>
  );
}
