import React from "react";
import { Link } from "@remix-run/react";
import {
  CheckCheck,
  CircleCheckBig,
  CircleDotDashed,
  Lock,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/libs/shadcn";

export function ModuleCard({ i }: any) {
  return (
    <Button
      disabled={i > 2}
      className="rounded-md text-black bg-stone-200 hover:bg-stone-300 py-4 relative border-b-2 border-zinc-600"
    >
      <Link
        to="/modules/1"
        className="flex flex-1 justify-between items-center p-2"
      >
        <div
          className={cn(
            "absolute rounded-tl rounded-br text-slate-50 text-xs p-1 bg-zinc-600 top-0 left-0",
            {
              "bg-sky-600": i <= 2,
            }
          )}
        >
          {i + 1}
        </div>
        <p className="text-lg pl-6">K8s service</p>
        {i < 2 ? (
          <>
            <CircleCheckBig size={20} className="text-sky-700" />
            {/* <CircleDotDashed size={20} className="text-sky-600" /> */}
          </>
        ) : (
          <>
            <Lock size={20} />
          </>
        )}
      </Link>
    </Button>
  );
}
