import { format } from "date-fns";
import { Image } from "~/components/image";
import type { User } from "~/utils/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type UserCardProps = {
  user: User;
};

export function UserCard({ user }: UserCardProps) {
  return (
    <Card className="shadow-lg bg-gradient-to-r from-zinc-100 to-sky-200">
      <CardHeader>
        <CardTitle className="text-lg font-black text-zinc-700 font-mono">
          👋 Hi, {user.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="text-xs">
          <p className="mt-4 text-zinc-600">
            😊 It&apos;s good to see you again.
          </p>
          <p className="mt-4 text-stone-700 font-black">
            🗓️ {format(new Date(), "do MMM, yyyy - p")}
          </p>
        </div>
        <Image
          cdn={false}
          src={user.avatarUrl!}
          alt={user.name!}
          width={24}
          height={24}
          className="w-24 hidden sm:block h-24 rounded-full"
        />
      </CardContent>
    </Card>
  );
}
