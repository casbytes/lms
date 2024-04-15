import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { useMatches } from "@remix-run/react";

type NavBarProps = {
  menuItems: { label: string; href: string }[];
  isNavOpen: boolean;
  setIsNavOpen: (value: boolean) => void;
  user?: any;
};

export function NavBar({
  menuItems,
  isNavOpen,
  setIsNavOpen,
  user,
}: NavBarProps) {
  const matches = useMatches();
  // const user = true;

  function handleNavToggle() {
    setIsNavOpen(!isNavOpen);
  }
  const authApp = matches.some((match) => match.id.includes("_auth-app"));
  return (
    <>
      <MainNav
        isOpen={isNavOpen}
        menuItems={menuItems}
        authApp={authApp}
        handleNavToggle={handleNavToggle}
      />
      <MobileNav
        menuItems={menuItems}
        isOpen={isNavOpen}
        authApp={authApp}
        handleNavToggle={handleNavToggle}
      />
    </>
  );
}
