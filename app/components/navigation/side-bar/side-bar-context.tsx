import * as React from "react";
import invariant from "tiny-invariant";
export interface SideBarProps {
  menuItems: {
    icon?: React.ReactNode;
    label: string;
    href: string;
  }[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSideBar?: () => void;
  children?: React.ReactNode;
}

export const SideBarContext = React.createContext({} as SideBarProps);

function SideBarProvider({
  menuItems,
  isOpen,
  setIsOpen,
  ...props
}: SideBarProps) {
  const toggleSideBar = () => setIsOpen(!isOpen);
  const values = { ...props, menuItems, isOpen, setIsOpen, toggleSideBar };
  return <SideBarContext.Provider value={values} {...props} />;
}

function useSideBar() {
  const context = React.useContext(SideBarContext);
  invariant(context, "useSideBar must be used within a SideBarProvider.");
  return context;
}

export { SideBarProvider, useSideBar };
