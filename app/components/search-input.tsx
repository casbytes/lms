import React from "react";
import { useSearchParams } from "@remix-run/react";
import { useDebounce } from "use-debounce";
import { Input } from "~/components/ui/input";
import { cn } from "~/libs/shadcn";

export function ModuleSearchInput({
  searchValue,
  placeholder,
  className,
}: {
  searchValue: string;
  placeholder: string;
  className?: string;
}) {
  const [, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedValue] = useDebounce(searchTerm, 400);

  React.useEffect(() => {
    if (debouncedValue) {
      setSearchParams(
        (params) => {
          params.set(searchValue, encodeURIComponent(debouncedValue));
          return params;
        },
        { preventScrollReset: true }
      );
    }
  }, [debouncedValue, searchValue, setSearchParams]);

  React.useEffect(() => {
    if (!searchTerm) {
      setSearchParams(
        (params) => {
          params.delete(searchValue);
          return params;
        },
        { preventScrollReset: true }
      );
    }
  }, [searchTerm, searchValue, setSearchParams]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.currentTarget.value);
  }

  return (
    <div className="flex w-full">
      <Input
        type="search"
        name="search"
        id="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        className={cn("w-full", className)}
      />
    </div>
  );
}
