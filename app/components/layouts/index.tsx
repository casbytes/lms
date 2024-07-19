import { LuLayoutDashboard } from "react-icons/lu";
import { GoProjectRoadmap } from "react-icons/go";
import {
  FaRegCalendarCheck,
  FaRegCircleUser,
  FaRegCreditCard,
  FaUsers,
} from "react-icons/fa6";
import { FaProjectDiagram, FaTasks } from "react-icons/fa";
export { RootLayout } from "./root-layout";

export const unAuthMenuItems = [
  { label: "courses", href: "courses" },
  { label: "FAQs", href: "faqs" },
  { label: "blog", href: "blog.casbytes.com" },
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
    icon: <FaProjectDiagram size={30} />,
    label: "projects",
    href: "a/projects",
  },
  {
    icon: <FaUsers size={30} />,
    label: "users",
    href: "a/users",
  },

  {
    icon: <FaRegCalendarCheck size={30} />,
    label: "events",
    href: "a/events",
  },
  {
    icon: <FaRegCircleUser size={30} />,
    label: "profile",
    href: "a/profile",
  },
];
