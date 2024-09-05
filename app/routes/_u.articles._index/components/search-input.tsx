import React from "react";
import { Input } from "~/components/ui/input";

export function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Input
      type="search"
      name="search"
      id="search"
      placeholder="Search"
      value={value}
      onChange={onChange}
    />
  );
}
