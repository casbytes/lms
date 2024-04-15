import { CircleCheckBig, CircleDotDashed, LockKeyhole } from "lucide-react";
import { useFetcher, useNavigate, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { BsLockFill, BsUnlockFill } from "react-icons/bs";
import { cn } from "~/libs/shadcn";
import { FaSpinner } from "react-icons/fa6";

export function Courses() {
  const course = useFetcher();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = navigation.formData?.get("intent") === "random";

  function handleCourseSubmit(i: number) {
    if (i > 1) {
      navigate("/subscription");
    } else {
      course.submit(
        { intent: "some" },
        {
          method: "POST",
        }
      );
    }
  }

  return (
    <course.Form onSubmit={(event) => event.preventDefault()}>
      <ul className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="w-full">
            <Button
              name="intent"
              value="random"
              onClick={() => handleCourseSubmit(i)}
              className={cn(
                "flex border-l-8 border-b-2 text-zinc-700 border-zinc-500 bg-zinc-200 hover:bg-zinc-300 justify-between w-full text-lg",
                {
                  "border-sky-600": i <= 2,
                }
              )}
            >
              <div className="flex gap-4 items-center">
                {/* {isLoading ? (
                  <FaSpinner size={20} className="animate-spin" />
                ) : null} */}
                {isLoading ? (
                  <FaSpinner size={20} className="animate-spin" />
                ) : i >= 2 ? (
                  <CircleDotDashed size={20} />
                ) : (
                  // <CircleCheckBig size={20} />
                  <LockKeyhole size={20} />
                )}
                <span className="capitalize">Kubernetes</span>{" "}
              </div>

              {i >= 2 ? (
                <BsLockFill className="text-zinc-500" />
              ) : (
                // <BsUnlockFill className="text-zinc-500" />
                <span className="p-1 bg-zinc-200 text-zinc-600 text-sm rounded-md">
                  free
                </span>
              )}
            </Button>
          </li>
        ))}
      </ul>
    </course.Form>
  );
}
