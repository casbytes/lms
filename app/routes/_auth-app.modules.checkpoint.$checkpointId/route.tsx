import React from "react";
import { Container } from "~/components/container";
import { Markdown } from "~/components/markdown";
import { PageTitle } from "~/components/page-title";

export default function CheckPointRoute() {
  const checkpointTitle = "some title";
  return (
    <Container className="max-w-4xl">
      <PageTitle title={`${checkpointTitle} | Checkpoint`} />
      <div>
        <Markdown
          source="
        some text some textsome textsome textsome textsome text some textsome\
        some text some textsome textsome textsome textsome text some textsome\
        some text some textsome textsome textsome textsome text some textsome\
        some text some textsome textsome textsome textsome text some textsome"
        />
      </div>
    </Container>
  );
}
