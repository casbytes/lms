import React from "react";
import { useFetcher, useNavigation } from "@remix-run/react";
import { CourseTitle } from "~/components/course-title";
import { Status } from "~/components/status";
import { CheckCircle, CircleDashed, LockKeyhole } from "lucide-react";
import { Button } from "~/components/ui/button";
import { FaSpinner } from "react-icons/fa6";

export function ModuleSideContent() {
  const lesson = useFetcher();
  const navigation = useNavigation();

  const isLoading = navigation.formData?.get("intent") === "some";
  return (
    <lesson.Form method="POST">
      <CourseTitle title="Functions" />
      <Status />
      <ul className="grid grid-cols-1 gap-4 p-2">
        {Array.from({ length: 25 }).map((_, i) => (
          <li key={i} className="flex justify-start ">
            <Button
              key={i}
              name="intent"
              value="some"
              disabled={i > 1}
              variant="secondary"
              className="flex items-center justify-start bg-slate-300 hover:bg-slate-300/50 text-black w-full"
            >
              <>
                {isLoading ? (
                  <FaSpinner
                    size={20}
                    className="mr-4 text-sky-600 animate-spin"
                  />
                ) : i < 2 ? (
                  <CheckCircle size={20} className="mr-4 text-blue-600" />
                ) : (
                  <LockKeyhole size={20} className="mr-4" />
                )}{" "}
                function prototypes
              </>
            </Button>
          </li>
        ))}
      </ul>
    </lesson.Form>
  );
}
