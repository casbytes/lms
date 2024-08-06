import type {
  Test as ITest,
  Checkpoint as ICheckpoint,
} from "~/utils/db.server";
import { Checkpoint } from "~/components/checkpoint";
import { Test } from "~/components/test";

type AssessmentProps = {
  item: {
    test: ITest | null;
    checkpoint: ICheckpoint | null;
  };
};

export function Assessment({ item }: AssessmentProps) {
  const { test, checkpoint } = item;
  return (
    <div className="flex flex-col gap-4">
      {test ? <Test test={test} /> : null}
      {checkpoint ? <Checkpoint checkpoint={checkpoint} /> : null}
    </div>
  );
}
