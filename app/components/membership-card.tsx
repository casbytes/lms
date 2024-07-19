import type { User } from "~/utils/db.server";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { Button } from "./ui/button";
import { Link } from "@remix-run/react";

export function MembershipCard({ user }: { user: User }) {
  const isSubscribed = user.subscribed;
  return (
    <div className="rounded-md bg-orange-300/35 p-6 flex flex-col items-center">
      <h2 className="text-2xl mb-4 text-orange-500">Membership</h2>
      {isSubscribed ? (
        <FaLockOpen className="h-12 w-12 text-orange-400" />
      ) : (
        <FaLock className="font-bold h-12 w-12 text-orange-400" />
      )}
      <p className="text-lg text-slate-600 text-center max-w-xs mt-4">
        {isSubscribed
          ? "You have unlocked all courses. Enjoy your learning experience."
          : "Subscribe now to access all courses."}
      </p>
      <Button
        disabled={isSubscribed}
        size="lg"
        className="mt-4 bg-orange-300/50 hover:bg-orange-200 text-orange-600"
      >
        <Link to="/subscription">
          {isSubscribed ? "Subscribed" : "Subscribe"}
        </Link>
      </Button>
    </div>
  );
}
