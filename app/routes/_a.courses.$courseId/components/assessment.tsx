import { Checkpoint } from "./checkpoint";
import { Test } from "./test";

export function Assessment({ subModules }: any) {
  const test = subModules[0]?.module?.test;
  const checkpoint = subModules[0]?.module?.checkpoint;

  const isCheckpointActive = test?.status === "COMPLETED";

  return (
    <div className="flex flex-col gap-6">
      {test ? (
        <Test key={test[0].id} test={test[0]} />
      ) : (
        <div className="text-center text-lg my-4">No test for this module.</div>
      )}

      {checkpoint ? (
        <Checkpoint
          key={checkpoint[0].id}
          isActive={isCheckpointActive}
          checkpoint={checkpoint[0]}
        />
      ) : (
        <div className="text-center text-lg my-4">
          No checkpoint for this module.
        </div>
      )}
    </div>
  );
}
