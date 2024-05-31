import { IModuleProgress } from "~/constants/types";
import { Checkpoint } from "./checkpoint";
import { Test } from "./test";

type AssessmentProps = {
  module: IModuleProgress;
};

export function Assessment({ module }: AssessmentProps) {
  const { test, checkpoint } = module;
  return (
    <div className="flex flex-col gap-6">
      {test ? (
        <Test key={test.id} test={test} />
      ) : (
        <div className="text-center text-lg my-4">No test for this module.</div>
      )}

      {checkpoint ? (
        <Checkpoint key={checkpoint.id} checkpoint={checkpoint} />
      ) : (
        <div className="text-center text-lg my-4">
          No checkpoint for this module.
        </div>
      )}
    </div>
  );
}
