import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function ChartFilter() {
  return (
    <Select>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="weekly" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="weekly">weekly</SelectItem>
        <SelectItem value="monthly">monthly</SelectItem>
      </SelectContent>
    </Select>
  );
}
