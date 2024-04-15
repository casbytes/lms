import { FaLockOpen } from "react-icons/fa6";
import { Button } from "./ui/button";
import { Link } from "@remix-run/react";

export function MembershipCard() {
  return (
    <div className="rounded-md bg-orange-300/35 p-6 flex flex-col items-center">
      <h2 className="text-2xl mb-4 text-orange-500">Membership</h2>
      {/* <FaLock className="font-bold h-12 w-12" /> */}
      <FaLockOpen className="h-12 w-12 text-orange-400" />
      <p className="text-lg text-slate-600 text-center max-w-xs mt-4">
        {/* Subscribe now to access all courses. */}
        You have unlocked all courses. Enjoy your learning experience.
      </p>
      <Button
        disabled
        size="lg"
        className="mt-4 bg-orange-300 hover:bg-orange-200 text-orange-600"
      >
        <Link to="/subscription">Subscribed</Link>
      </Button>
    </div>
  );
}
