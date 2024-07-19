import React from "react";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdArrowDropup,
} from "react-icons/io";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

export function TaskTable() {
  return (
    <div className="mt-12">
      <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4 items-center">
        <Input name="search" placeholder="search" />
        <div>
          <div className="text-sm">Filter:</div>
          <ToggleGroup type="multiple" className="border-2 rounded-md">
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              Role <IoMdArrowDropup size={20} />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              Name <IoMdArrowDropup size={20} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="strikethrough"
              aria-label="Toggle strikethrough"
            >
              Email <IoMdArrowDropup size={20} />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <div className="text-sm">20 of 200 rows</div>
          <ToggleGroup type="multiple" className="border-2 rounded-md">
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <IoIosArrowBack size={30} />
            </ToggleGroupItem>
            <Select>
              <SelectTrigger className="w-[100px] border-top-none border-bottom-none">
                <SelectValue placeholder="20" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>rows</SelectLabel>
                  <SelectItem value="apple">20</SelectItem>
                  <SelectItem value="banana">40</SelectItem>
                  <SelectItem value="blueberry">80</SelectItem>
                  <SelectItem value="grapes">120</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <ToggleGroupItem
              value="strikethrough"
              aria-label="Toggle strikethrough"
            >
              <IoIosArrowForward size={30} />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <Table className="bg-zinc-100 border-2">
        <TableCaption>Users</TableCaption>
        <TableHeader className="text-lg">
          <TableRow>
            <TableHead>Task:</TableHead>
            <TableHead>User:</TableHead>
            <TableHead>Status:</TableHead>
            <TableHead>Score:</TableHead>
            <TableHead>🤷‍♂️</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>some</TableCell>
            <TableCell>thing</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
