import React from "react";
import ReactMarkdown from "react-markdown";
// import codeTitles from "remark-code-titles";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkEmoji from "remark-emoji";
import remarkFlexibleContainers from "remark-flexible-containers";

import {
  B,
  BlockQuote,
  CodeBlock,
  Div,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Img,
  MdLink,
  OL,
  P,
  Strong,
  UL,
} from "./components";

export function Markdown({ source }: { source: string }) {
  const Component = React.useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkFlexibleContainers as any,
          remarkEmoji,
        ]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: H1,
          h2: H2,
          h3: H3,
          h4: H4,
          h5: H5,
          h6: H6,
          p: P,
          div: Div,
          ul: UL,
          ol: OL,
          b: B,
          strong: Strong,
          a: MdLink,
          img: Img,
          code: CodeBlock,
          blockquote: BlockQuote,
        }}
      >
        {source}
      </ReactMarkdown>
    ),
    [source]
  );
  return <>{Component}</>;
}
