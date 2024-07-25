import { NotFoundUI } from "~/components/not-found-ui";
import { metaFn } from "~/utils/meta";

export const meta = metaFn;

export default function NotFound() {
  return <NotFoundUI />;
}
