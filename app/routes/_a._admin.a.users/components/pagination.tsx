import { useSearchParams } from "@remix-run/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { UserTableProps } from "./user-table";

export function Pagination({ pageData }: UserTableProps) {
  const { pageSize, currentPage, rowsPerPage, totalPages } = pageData;
  const [, setSearchParams] = useSearchParams();

  function handlePageChange(newPage: number) {
    setSearchParams((params) => {
      params.set("page", newPage.toString());
      return params;
    });
  }

  function handlePageSizeChange(value: string) {
    setSearchParams((params) => {
      params.set("pageSize", value);
      return params;
    });
  }

  const visibleRows = currentPage * pageSize - pageSize + 1;
  const currentRows = currentPage * pageSize;
  const totalRows = totalPages * pageSize;

  return (
    <div>
      <div className="text-sm">
        {visibleRows} - {currentRows} of {totalRows} rows
      </div>
      <ToggleGroup type="multiple" className="border-2 rounded-md">
        <ToggleGroupItem
          value="back"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <IoIosArrowBack size={30} />
        </ToggleGroupItem>
        <Select
          onValueChange={handlePageSizeChange}
          value={pageSize.toString()}
        >
          <SelectTrigger className="w-[70px] border-top-none border-bottom-none">
            <SelectValue placeholder={`${rowsPerPage}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Rows per page</SelectLabel>
              {[20, 60, 100, 120].map((rows) => (
                <SelectItem key={rows} value={rows.toString()}>
                  {rows}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <ToggleGroupItem
          value="forward"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <IoIosArrowForward size={30} />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
