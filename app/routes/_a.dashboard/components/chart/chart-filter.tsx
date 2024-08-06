import { useSearchParams } from "@remix-run/react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
export function ChartFilter() {
  const [, setSearchParams] = useSearchParams();
  function handleSubmit(filter: "days" | "weeks" | "months") {
    setSearchParams(
      (params) => {
        params.set("filter", filter);
        return params;
      },
      { preventScrollReset: true }
    );
  }

  return (
    <div className="flex flex-col items-start">
      {/* <div className="text-sm text-slate-500">Filter:</div> */}
      <ToggleGroup type="single" size="sm" className="border-2 rounded-md">
        <ToggleGroupItem
          value="days"
          onClick={() => handleSubmit("days")}
          aria-label="Daily learning time"
        >
          Days
        </ToggleGroupItem>
        <ToggleGroupItem
          value="weeks"
          onClick={() => handleSubmit("weeks")}
          aria-label="Weekly learning time"
        >
          Weeks
        </ToggleGroupItem>
        <ToggleGroupItem
          value="months"
          onClick={() => handleSubmit("months")}
          aria-label="Monthly learning time"
        >
          Months
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
