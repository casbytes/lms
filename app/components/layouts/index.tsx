import { LuLayoutDashboard } from "react-icons/lu";
import { GoProjectRoadmap } from "react-icons/go";
import {
  FaRegCalendarCheck,
  FaRegCircleUser,
  FaRegCreditCard,
} from "react-icons/fa6";
export { RootLayout } from "./root-layout";

export const unAuthMenuItems = [
  { label: "courses", href: "courses" },
  { label: "FAQs", href: "faqs" },
  { label: "blog", href: "blog.casbytes.com" },
];

export const authMenuItems = [
  {
    icon: <LuLayoutDashboard size={30} />,
    label: "dashboard",
    href: "dashboard",
  },
  {
    icon: <GoProjectRoadmap size={30} />,
    label: "onboarding",
    href: "onboarding",
  },

  {
    icon: <FaRegCalendarCheck size={30} />,
    label: "events",
    href: "events",
  },
  {
    icon: <FaRegCreditCard size={30} />,
    label: "subscription",
    href: "subscription",
  },
  {
    icon: <FaRegCircleUser size={30} />,
    label: "profile",
    href: "profile",
  },
];
