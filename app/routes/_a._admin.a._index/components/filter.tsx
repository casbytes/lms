import React from "react";
import { useSearchParams } from "@remix-run/react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

type Order = "asc" | "desc";

export function Filter() {
  const [nameOrder, setNameOrder] = React.useState<Order>("asc");
  const [emailOrder, setEmailOrder] = React.useState<Order>("asc");
  const [, setSearchParams] = useSearchParams();

  function toggleOrder(field: "email" | "name") {
    if (field === "email") {
      setEmailOrder(emailOrder === "asc" ? "desc" : "asc");
    } else if (field === "name") {
      setNameOrder(nameOrder === "asc" ? "desc" : "asc");
    }
  }

  function handleNameOrder() {
    toggleOrder("name");
    setSearchParams((params) => {
      params.set("nameOrder", nameOrder);
      return params;
    });
  }

  function handleEmailOrder() {
    toggleOrder("email");
    setSearchParams((params) => {
      params.set("emailOrder", emailOrder);
      return params;
    });
  }

  return (
    <div>
      <div className="text-sm">Filter:</div>
      <ToggleGroup type="multiple" className="border-2 rounded-md">
        <ToggleGroupItem value="name" onClick={handleNameOrder}>
          Name{" "}
          {nameOrder === "asc" ? (
            <IoMdArrowDropup size={20} />
          ) : (
            <IoMdArrowDropdown size={20} />
          )}
        </ToggleGroupItem>
        <ToggleGroupItem value="email" onClick={handleEmailOrder}>
          Email{" "}
          {emailOrder === "asc" ? (
            <IoMdArrowDropup size={20} />
          ) : (
            <IoMdArrowDropdown size={20} />
          )}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
