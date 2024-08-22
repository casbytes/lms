import { v4 as uuid } from "uuid";
import { subModules } from "./sub-modules";

export const html = {
  title: "HTML",
  id: uuid(),
  published: false,
  subModules: [...subModules],
};
