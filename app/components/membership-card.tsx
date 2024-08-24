import type { User } from "~/utils/db.server";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { Button } from "./ui/button";
import { Link } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function MembershipCard({ user }: { user: User }) {
  const isSubscribed = user.subscribed;
  return (
    <Card className="flex flex-col items-center h-full bg-orange-300/35 border-orange-500 shadow-lg">
      <CardHeader>
        <CardTitle className="font-mono">Membership</CardTitle>
      </CardHeader>
      <CardContent>
        <p className=" text-slate-600 text-center max-w-xs mt-4">
          {isSubscribed
            ? "You have unlocked all courses. Enjoy your learning experience."
            : "Subscribe now to access all courses."}
        </p>
        <Button
          disabled={isSubscribed}
          size="lg"
          className="mt-4 bg-orange-300/50 hover:bg-orange-200 text-orange-700 mx-auto block"
        >
          <Link to="/subscription" className="flex gap-4 items-center">
            {isSubscribed ? (
              <FaLockOpen className="h-6 w-6 text-orange-400" />
            ) : (
              <FaLock className="font-bold h-6 w-6 text-orange-400" />
            )}
            {isSubscribed ? "Premium" : "Subscribe"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
