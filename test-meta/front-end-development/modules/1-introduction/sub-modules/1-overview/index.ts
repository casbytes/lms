import { v4 as uuid } from "uuid";
import { lessons } from "./lessons";
export const overview = {
  title: "Overview",
  id: uuid(),
  lessons: [...lessons],
};
