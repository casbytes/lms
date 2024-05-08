import React from "react";
import { Outlet } from "@remix-run/react";
import { NavBar } from "~/components/navigation";
import { Footer } from "~/components/footer";
import { Dialog } from "~/components/ui/dialog";
import { AuthDialog } from "./components/auth-dialog";

export default function UnAuthApp() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  return (
    <Dialog>
      <NavBar
        menuItems={menuItems}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
      />
      <AuthDialog />
      <Outlet />
      <Footer />
    </Dialog>
  );
}

export const menuItems = [
  { label: "courses", href: "courses" },
  { label: "FAQs", href: "faqs" },
  { label: "blog", href: "blog.casbytes.com" },
];
