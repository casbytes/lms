import React from "react";
import type { User } from "~/utils/db.server";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { FaHeart } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getInitials } from "~/utils/helpers";

export function UserOverview({ user }: { user: User }) {
  const initials = getInitials(user.name!);
  const avatarSrc = React.useMemo(() => {
    const seed = user.name!.split(" ")[0];
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
  }, [user.name]);

  return (
    <div className="flex flex-col gap-6 sm:flex-row justify-between mt-8 md:mt-2 rounded-md p-2 shadow-xl border border-sky-500 bg-gradient-to-r from-sky-200 to-slate-200">
      <div className="flex justify-start sm:justify-between gap-6 flex-wrap xs:flex-nowrap items-center">
        <Avatar>
          <AvatarImage alt={user.name!} src={avatarSrc} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <p className="text-2xl">{user.name}</p>
      </div>

      <div className="flex gap-6 justify-start sm:justify-between items-center">
        {user.subscribed ? (
          <div className="bg-sky-600 rounded-md p-4 text-white text-lg h-10 flex items-center">
            <AiOutlineDollarCircle className="mr-2 h-6 w-6" /> Premium
          </div>
        ) : (
          <div className="bg-slate-500 rounded-md p-4 text-white text-lg h-10 flex items-center">
            <FaHeart className="mr-2 h-6 w-6" />
            Free
          </div>
        )}
      </div>
    </div>
  );
}
