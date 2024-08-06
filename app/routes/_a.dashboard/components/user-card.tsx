import { format } from "date-fns";
import type { User } from "~/utils/db.server";

type UserCardProps = {
  user: User;
};

export function UserCard({ user }: UserCardProps) {
  return (
    <article className="bg-sky-300/40 rounded-md p-4 flex flex-col justify-center relative w-full border border-sky-500 shadow-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-indigo-700">
          👋 Hi, {user.name}
        </h1>
        <img
          src="https://cdn.casbytes.com/assets/welcome-back.webp"
          width={200}
          alt="Welcome back"
          className="absolute -z-10 sm:z-10 md:-z-10 lg:z-6 right-2 lg:-right-20"
        />
      </div>
      <p className="mt-4">😊 It&apos;s good to see you again.</p>
      <p className="mt-4 text-sky-700 font-black">
        🗓️ {format(new Date(), "do MMMM, yyyy - p")}
      </p>
    </article>
  );
}
