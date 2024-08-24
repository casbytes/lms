import { v4 as uuid } from "uuid";
import { modules } from "./modules";
import { Base } from "meta/types";

export const frontEndDevelopment = {
  title: "front-end development",
  id: uuid(),
  published: false,
  modules: [...modules],
};
