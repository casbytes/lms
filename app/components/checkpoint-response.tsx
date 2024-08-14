import type { Checkpoint, Project } from "~/utils/db.server";
import type {
  ApiResponse,
  LintResult,
  TestResults,
} from "~/utils/helpers.server";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { SiVitest } from "react-icons/si";
import { capitalizeFirstLetter } from "~/utils/helpers";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

type CheckpointResponseProps = {
  item: Checkpoint | Project;
  response: ApiResponse | null;
};

export function CheckpointResponse({
  item,
  response,
}: CheckpointResponseProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="fixed right-10 bottom-10 shadow-2xl">
          <SiVitest className="text-sky-50 mr-2" size={20} />
          CHECK
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-scroll">
        <DialogHeader>
          <DialogTitle>{capitalizeFirstLetter(item.title)}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableCaption>{item.title} status.</TableCaption>
          <TableBody className="bg-slate-100 p-2 rounded-md">
            <TableRow>
              <TableCell>Score</TableCell>
              <TableCell>
                <Badge>{item.score}</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Status:</TableCell>
              <TableCell>
                <Badge>{item.status}</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Separator />
        {response?.error ? <ErrorUI error={response.error} /> : null}
        {response?.lintResults ? (
          <LintUI lintResults={response.lintResults} />
        ) : null}
        {response?.testResults ? (
          <TestUI testResults={response.testResults} />
        ) : null}
        <Separator />
        <DialogFooter>
          <DialogClose>
            <Button variant={"outline"}>Close</Button>
          </DialogClose>
          <Button>
            {" "}
            <SiVitest className="text-sky-50" size={20} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ErrorUI({ error }: { error: string }) {
  return (
    <pre className="p-4 bg-gray-100 text-red-500 rounded-sm whitespace-pre-wrap text-sm">
      {error.split("\n").map((line, index) => (
        <div key={`line-${index}`}>
          {index + 1} {line}
        </div>
      ))}
    </pre>
  );
}
function LintUI({ lintResults }: { lintResults: LintResult[] }) {
  return <div>{JSON.stringify(lintResults)}</div>;
}
function TestUI({ testResults }: { testResults: TestResults }) {
  return <div>{JSON.stringify(testResults)}</div>;
}
