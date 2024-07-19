import type {
  Test as ITest,
  Checkpoint as ICheckpoint,
} from "~/utils/db.server";
import { Checkpoint } from "~/components/checkpoint";
import { Test } from "~/components/test";

type AssessmentProps = {
  item: {
    test: ITest;
    checkpoint: ICheckpoint;
  };
};

export function Assessment({ item }: AssessmentProps) {
  const { test, checkpoint } = item;
  return (
    <div className="flex flex-col gap-4">
      <Test test={test} />
      <Checkpoint checkpoint={checkpoint} />
    </div>
  );
}
