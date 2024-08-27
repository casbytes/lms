import React from "react";
import { format } from "date-fns";
import { Image } from "~/components/image";
import type { User } from "~/utils/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type UserCardProps = {
  user: User;
};

export function UserCard({ user }: UserCardProps) {
  const avatarSrc = React.useMemo(() => {
    const seed = user.name!.split(" ")[0];
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
  }, [user.name]);
  return (
    <Card className="shadow-lg bg-gradient-to-r from-zinc-100 to-sky-200">
      <CardHeader>
        <CardTitle className="text-lg font-black text-zinc-700 font-mono">
          👋 Hi, {user.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="mt-4 text-zin-600 font-serif">
            😊 It&apos;s good to see you again.
          </p>
          <p className="mt-4 text-stone-700 font-black text-sm">
            🗓️ {format(new Date(), "do MMMM, yyyy - p")}
          </p>
        </div>
        <Image
          cdn={false}
          src={avatarSrc}
          alt="Welcome back"
          width={24}
          height={24}
          className="w-24 hidden sm:block h-24"
        />
      </CardContent>
    </Card>
  );
}
