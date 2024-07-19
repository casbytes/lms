import type { User } from "~/utils/db.server";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { Button } from "./ui/button";
import { Link } from "@remix-run/react";

export function DiscordCard({ user }: { user: User }) {
  const isSubscribed = user.subscribed;
  return (
    <div className="rounded-md bg-blue-400/35 p-6 flex flex-col items-center">
      <h2 className="text-2xl mb-4 text-blue-600">Discord community</h2>
      {isSubscribed ? (
        <FaLockOpen className="h-12 w-12 text-blue-400" />
      ) : (
        <FaLock className="font-bold h-12 w-12 text-blue-500" />
      )}

      <p className="text-lg text-slate-600 text-center max-w-xs mt-4">
        {isSubscribed
          ? "You now have access to our Discord community. Enjoy your learning experience!"
          : "Upgrade to CASBytes Premium to gain access to our community Discord server."}
      </p>
      <Button
        disabled={!isSubscribed}
        size="lg"
        className="mt-4 bg-blue-400/50 hover:bg-blue-400 text-blue-700"
      >
        <Link to="/subscription">Join discord</Link>
      </Button>
    </div>
  );
}
