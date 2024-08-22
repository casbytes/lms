import { useSearchParams } from "@remix-run/react";
import React from "react";
import { useDebounce } from "use-debounce";
import { Input } from "~/components/ui/input";

export function ModuleSearchInput({ searchValue }: { searchValue: string }) {
  const [, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedValue] = useDebounce(searchTerm, 500);

  React.useEffect(() => {
    if (debouncedValue) {
      setSearchParams((params) => {
        params.set(searchValue, encodeURIComponent(debouncedValue));
        return params;
      });
    }
  }, [debouncedValue, searchValue, setSearchParams]);

  React.useEffect(() => {
    if (!searchTerm) {
      setSearchParams((params) => {
        params.delete(searchValue);
        return params;
      });
    }
  }, [searchTerm, searchValue, setSearchParams]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.currentTarget.value);
  }

  return (
    <div className="flex w-full items-end">
      <Input
        type="search"
        name="search"
        id="search"
        placeholder="search"
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  );
}
