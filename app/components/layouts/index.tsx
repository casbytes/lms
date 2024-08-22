import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegCircleUser, FaRegCreditCard, FaUsers } from "react-icons/fa6";
import { MdOutlineArticle, MdOutlineDirections } from "react-icons/md";
export { RootLayout } from "./root-layout";

const ARTICLE_URL = "https://articles.casbytes.com";

export const unAuthMenuItems = [
  { label: "courses", href: "courses" },
  { label: "FAQs", href: "faqs" },
  {
    label: "articles",
    href: ARTICLE_URL,
    target: "_blank",
  },
];

export const userMenuItems = [
  {
    icon: <LuLayoutDashboard size={30} />,
    label: "dashboard",
    href: "dashboard",
  },
  {
    icon: <MdOutlineDirections size={30} />,
    label: "onboarding",
    href: "onboarding",
  },
  {
    icon: <FaRegCreditCard size={30} />,
    label: "subscription",
    href: "subscription",
  },
  {
    icon: <MdOutlineArticle size={30} />,
    label: "articles",
    href: ARTICLE_URL,
    target: "_blank",
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
    icon: <FaUsers size={30} />,
    label: "users",
    href: "a/users",
  },
  {
    icon: <MdOutlineArticle size={30} />,
    label: "articles",
    href: ARTICLE_URL,
    target: "_blank",
  },
  {
    icon: <FaRegCircleUser size={30} />,
    label: "profile",
    href: "a/profile",
  },
];
