import { MdInfoOutline } from "react-icons/md";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

export function TrophyCarbinet() {
  return (
    <ul className="flex justify-evenly flex-wrap gap-4 p-2 mb-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <HoverCard key={i}>
          <HoverCardTrigger>
            <li key={i} className="flex items-center text-lg relative">
              <span className="absolute -top-2 -right-2">
                <MdInfoOutline size={20} />
              </span>
              <img src="/favicon.png" className="w-16 h-16" alt="" />
            </li>
          </HoverCardTrigger>
          <HoverCardContent>
            <h1 className="text-lg">some h1</h1>
            <p>some description</p>
          </HoverCardContent>
        </HoverCard>
      ))}
    </ul>
  );
}
