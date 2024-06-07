import React from "react";
import { Form } from "@remix-run/react";
import { FaPlus } from "react-icons/fa6";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

type CheckpointFormProps = {
  setLinks: React.Dispatch<React.SetStateAction<string[]>>;
};

export function ProjectForm({ setLinks }: CheckpointFormProps) {
  const [title, setTitle] = React.useState("");
  function handleAddLink(link: string) {
    setLinks((prevLinks: string[]) => [...prevLinks, link]);
    setTitle("");
  }
  return (
    <Form method="post" className="flex flex-col gap-2">
      <Input
        type="url"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        name="title"
        placeholder="Link"
      />
      <Button
        onClick={() => handleAddLink(title)}
        type="button"
        variant="outline"
        className="self-end"
      >
        <FaPlus className="mr-2" /> Add
      </Button>
    </Form>
  );
}
