import { LuLayoutDashboard } from "react-icons/lu";
import { GoProjectRoadmap } from "react-icons/go";
import { FaRegCircleUser, FaRegCreditCard, FaUsers } from "react-icons/fa6";
import { FaTasks } from "react-icons/fa";
export { RootLayout } from "./root-layout";

export const unAuthMenuItems = [
  { label: "courses", href: "courses" },
  { label: "FAQs", href: "faqs" },
  { label: "blog", href: "https://blog.casbytes.com", target: "_blank" },
];

export const userMenuItems = [
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

export const adminMenuItems = [
  {
    icon: <LuLayoutDashboard size={30} />,
    label: "dashboard",
    href: "a",
  },
  {
    icon: <FaTasks size={30} />,
    label: "tasks",
    href: "a/tasks",
  },
  {
    icon: <FaUsers size={30} />,
    label: "users",
    href: "a/users",
  },
  {
    icon: <FaRegCircleUser size={30} />,
    label: "profile",
    href: "a/profile",
  },
];
