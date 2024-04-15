import {
  CheckCircle,
  CircleDotDashed,
  LockKeyhole,
  SigmaSquare,
} from "lucide-react";
import { Badge } from "./ui/badge";

export function Status() {
  return (
    <ul className="gap-4 grid grid-cols-1 sm:grid-cols-2 border-l-4 border-blue-600 p-2 text-md my-4 text-md">
      <li className="flex items-center">
        <CheckCircle className="mr-2 text-blue-600" /> Completed:{" "}
        <Badge className="rounded-full ml-2">2</Badge>
      </li>
      <li className="flex items-center">
        <CircleDotDashed className="mr-2 text-blue-600" /> In progress:{" "}
        <Badge className="rounded-full ml-2">1</Badge>
      </li>
      <li className="flex items-center">
        <LockKeyhole className="mr-2 text-slate-400" /> Locked:{" "}
        <Badge className="rounded-full ml-2">17</Badge>
      </li>
      <li className="flex items-center">
        <SigmaSquare className="mr-2" /> Total:{" "}
        <Badge className="rounded-full ml-2">20</Badge>
      </li>
    </ul>
  );
}
