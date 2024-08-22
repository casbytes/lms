import React from "react";
import { format } from "date-fns";
import { Image } from "~/components/image";
import type { User } from "~/utils/db.server";

type UserCardProps = {
  user: User;
};

export function UserCard({ user }: UserCardProps) {
  const avatarSrc = React.useMemo(() => {
    const seed = user.name!.split(" ")[0];
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
  }, [user.name]);
  return (
    <article className="bg-sky-300/40 rounded-md p-4 flex justify-between items-center w-full border border-sky-500 shadow-xl">
      <div>
        <h1 className="text-xl font-black text-indigo-700">
          👋 Hi, {user.name}
        </h1>

        <p className="mt-4">😊 It&apos;s good to see you again.</p>
        <p className="mt-4 text-sky-700 font-black">
          🗓️ {format(new Date(), "do MMMM, yyyy - p")}
        </p>
      </div>
      <Image
        cdn={false}
        src={avatarSrc}
        alt="Welcome back"
        className="w-24 hidden sm:block"
      />
    </article>
  );
}
