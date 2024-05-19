import { Link, NavLink, useMatches } from "@remix-run/react";
import { Menu } from "lucide-react";
import { RiMenuFoldFill } from "react-icons/ri";
import { cn } from "~/libs/shadcn";
import { Button } from "~/components/ui/button";
import { SheetTrigger } from "~/components/ui/sheet";
import { DialogTrigger } from "~/components/ui/dialog";

type MainNavProps = {
  menuItems?: { label: string; href: string }[];
  isOpen: boolean;
  authApp: boolean;
  handleNavToggle: () => void;
};

type ItemProps = {
  label: string;
  href: string;
};

export function MainNav({
  isOpen,
  menuItems,
  authApp,
  handleNavToggle,
}: MainNavProps) {
  const matches = useMatches();

  const contentRoutes = matches.some(
    (match) =>
      match.id.includes("courses") ||
      match.id.includes("modules") ||
      match.id.includes("sub-modules")
  );
  return (
    <nav className={cn("bg-[#E1F4FF]", authApp ? "lg:hidden block" : "")}>
      <div
        className={cn(
          "flex items-center justify-between py-8 px-4 xl:px-0 max-w-6xl mx-auto",
          {
            "p-4": authApp,
          }
        )}
      >
        {/* if a user is authenticated, show the drowpdown menu for mobile nav before the logo */}
        <div className={cn("flex", authApp ? "gap-2" : "")}>
          {authApp ? (
            <Button
              onClick={handleNavToggle}
              size="icon"
              variant="ghost"
              aria-label="toggle navigation"
              className="lg:hidden"
              id="navbar"
              asChild
            >
              <Menu className="h-4 w-4 font-black" />
            </Button>
          ) : null}
          <Button variant="ghost" asChild>
            <Link to={authApp ? "/dashboard" : "/"}>
              <img
                src={`https://cdn.casbytes.com/assets/${
                  authApp ? "icon.png" : "logo.png"
                }`}
                alt="CASBytes"
                width={authApp ? 40 : 200}
                height={authApp ? 40 : 200}
              />
            </Link>
          </Button>
        </div>

        <div className="hidden lg:flex gap-4">
          <div className="flex gap-4 items-center">
            <ul className="flex gap-4">
              {menuItems && menuItems?.length > 0
                ? menuItems?.map((item: ItemProps, index: number) => (
                    <li key={`${item}-${index}`}>
                      <NavLink
                        key={`${item.href}-${index}`}
                        to={item.href}
                        aria-label={item.label}
                        className={({ isActive }) =>
                          isActive ? "text-blue-600 rounded-md" : ""
                        }
                      >
                        <Button variant="link" className="text-lg capitalize">
                          {item.label}
                        </Button>
                      </NavLink>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
        {/* if a user is authenticated, show the side content drawer icon else show the drowpdown menu for mobile nav */}
        <div>
          {authApp ? (
            <SheetTrigger className={cn(contentRoutes ? "" : "hidden")}>
              <RiMenuFoldFill size={32} className="cursor-pointer" />
            </SheetTrigger>
          ) : (
            <Button
              onClick={handleNavToggle}
              size="icon"
              variant="ghost"
              aria-label="toggle navigation"
              className="lg:hidden"
              id="navbar"
              asChild
            >
              <Menu className="h-4 w-4 font-black" />
            </Button>
          )}

          <div className="lg:flex gap-4 hidden items-center">
            <DialogTrigger asChild>
              <Button aria-label="sign in" className="capitalize text-lg">
                sign in
              </Button>
            </DialogTrigger>
          </div>
        </div>
      </div>
    </nav>
  );
}
