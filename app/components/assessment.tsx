import { types } from "~/utils/db.server";
import { Checkpoint } from "~/components/checkpoint";
import { Test } from "~/components/test";

type AssessmentProps = {
  item: {
    test: types.Test;
    checkpoint: types.Checkpoint;
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
