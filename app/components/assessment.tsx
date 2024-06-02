import { IModuleProgress, ISubModuleProgress } from "~/constants/types";
import { Checkpoint } from "~/components/checkpoint";
import { Test } from "~/components/test";

type AssessmentProps = {
  item: IModuleProgress | ISubModuleProgress;
};

export function Assessment({ item }: AssessmentProps) {
  const { test, checkpoint } = item;
  return (
    <div className="flex flex-col gap-4">
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
