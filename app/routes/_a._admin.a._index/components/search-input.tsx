import React from "react";
import { useSearchParams } from "@remix-run/react";
import { useDebounce } from "use-debounce";
import { Input } from "~/components/ui/input";

export function SearchInput() {
  const [, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedValue] = useDebounce(searchTerm, 500);

  React.useEffect(() => {
    if (debouncedValue) {
      setSearchParams((params) => {
        params.set("search", encodeURIComponent(debouncedValue));
        return params;
      });
    }
  }, [debouncedValue, setSearchParams]);

  React.useEffect(() => {
    if (!searchTerm) {
      setSearchParams((params) => {
        params.delete("search");
        return params;
      });
    }
  }, [searchTerm, setSearchParams]);

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
