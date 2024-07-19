import React from "react";
import highlightjs from "highlight.js";
import { Link } from "@remix-run/react";
import { MdOutlineContentCopy } from "react-icons/md";
import { IoCheckmarkDone, IoWarning } from "react-icons/io5";
import { FaLightbulb, FaQuoteLeft } from "react-icons/fa6";
import { cn } from "~/libs/shadcn";
import { RiErrorWarningFill } from "react-icons/ri";
import { Button } from "~/components/ui/button";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/use-toast";

/**
 *
 * @param {React.HTMLAttributes<HTMLParagraphElement | HTMLImageElement>} props
 * @returns {JSX.Element}
 */
export function P(
  props: React.HTMLAttributes<HTMLParagraphElement | HTMLImageElement>
): JSX.Element {
  if (
    React.isValidElement(props.children) &&
    typeof props.children.type === "string" &&
    props.children.type === "img"
  ) {
    return <>{props.children}</>;
  }
  return <p className="my-4" {...props} />;
}

/**
 * Div component
 * @param {React.HTMLAttributes<HTMLDivElement>} props
 * @returns {JSX.Element}
 */
export function Div(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  const { className, children, ...rest } = props;

  if (className) {
    if (className.includes("remark-container info")) {
      return (
        <div
          className={cn(
            "border-blue-600 text-blue-900 bg-blue-100/30",
            className
          )}
          {...rest}
        >
          <span className="icon text-blue-800">
            <FaLightbulb size={25} />
          </span>
          {children}
        </div>
      );
    } else if (className.includes("remark-container warning")) {
      return (
        <div
          className={cn(
            className,
            "border-yellow-600 text-yellow-800 bg-yellow-100/30"
          )}
          {...rest}
        >
          <span className="icon text-yellow-700">
            <IoWarning size={25} />
          </span>
          {children}
        </div>
      );
    } else if (className.includes("remark-container caution")) {
      return (
        <div
          className={cn(className, "border-red-500 text-red-700 bg-red-100/50")}
          {...rest}
        >
          <span className="icon text-red-600">
            <RiErrorWarningFill size={25} />
          </span>
          {children}
        </div>
      );
    }
  }

  return (
    <div {...rest} className={className}>
      {children}
    </div>
  );
}

/**
 * H1 component
 * @param {React.HTMLAttributes<HTMLHeadElement>} props
 * @returns {JSX.Element}
 */
export function H1(props: React.HTMLAttributes<HTMLHeadElement>): JSX.Element {
  return (
    <h1
      className="text-3xl mt-5 mb-4 capitalize dark:text-amber-600 text-blue-600"
      {...props}
    >
      {props.children}
    </h1>
  );
}

/**
 * H2 component
 * @param {React.HTMLAttributes<HTMLHeadElement>} props
 * @returns {JSX.Element}
 */
export function H2(props: React.HTMLAttributes<HTMLHeadElement>): JSX.Element {
  return (
    <h2
      className="text-2xl mt-4 mb-3 capitalize dark:text-amber-600 text-blue-600"
      {...props}
    >
      {props.children}
    </h2>
  );
}

/**
 * H3 component
 * @param {React.HTMLAttributes<HTMLHeadElement>} props
 * @returns {JSX.Element}
 */
export function H3(props: React.HTMLAttributes<HTMLHeadElement>): JSX.Element {
  return (
    <h3
      className="text-xl mt-3 mb-2 capitalize dark:text-amber-600 text-blue-600"
      {...props}
    >
      {props.children}
    </h3>
  );
}

/**
 * H4 component
 * @param {React.HTMLAttributes<HTMLHeadElement>} props
 * @returns {JSX.Element}
 */
export function H4(props: React.HTMLAttributes<HTMLHeadElement>): JSX.Element {
  return (
    <h4
      className="text-lg mt-3 mb-2 capitalize dark:text-amber-600 text-blue-600"
      {...props}
    >
      {props.children}
    </h4>
  );
}

/**
 * H5 component
 * @param {React.HTMLAttributes<HTMLHeadElement>} props
 * @returns {JSX.Element}
 */
export function H5(props: React.HTMLAttributes<HTMLHeadElement>): JSX.Element {
  return (
    <h5
      className="text-lg mt-3 mb-2 capitalize dark:text-amber-600 text-blue-600"
      {...props}
    >
      {props.children}
    </h5>
  );
}

/**
 * H6 component
 * @param {React.HTMLAttributes<HTMLHeadElement>} props
 * @returns {JSX.Element}
 */
export function H6(props: React.HTMLAttributes<HTMLHeadElement>): JSX.Element {
  return (
    <h6
      className="text-lg mt-3 mb-2 capitalize dark:text-amber-600 text-blue-600"
      {...props}
    >
      {props.children}
    </h6>
  );
}

/**
 * UL component
 * @param {React.HTMLAttributes<HTMLUListElement>} props
 * @returns {JSX.Element}
 */
export function UL(props: React.HTMLAttributes<HTMLUListElement>): JSX.Element {
  return (
    <ul className="list-disc list-inside space-y-2" {...props}>
      {props.children}
    </ul>
  );
}

/**
 * OL component
 * @param {React.HTMLAttributes<HTMLOListElement>} props
 * @returns {JSX.Element}
 */
export function OL(props: React.HTMLAttributes<HTMLOListElement>): JSX.Element {
  return (
    <ol className="list-decimal list-inside space-y-2" {...props}>
      {props.children}
    </ol>
  );
}

/**
 * BlockQuote component
 * @param {React.HTMLAttributes<HTMLQuoteElement>} props
 * @returns {JSX.Element}
 */
export function BlockQuote(
  props: React.HTMLAttributes<HTMLQuoteElement>
): JSX.Element {
  return (
    <blockquote
      className=" bg-slate-200 border-l-8 border-slate-500 text-black p-4 my-6 rounded-md relative"
      {...props}
    >
      <FaQuoteLeft
        title="Info"
        className="w-6 h-6 absolute text-slate-400 top-2 right-2"
      />
      {props.children}
    </blockquote>
  );
}

/**
 * Strong component
 * @param {React.HTMLAttributes<HTMLElement>} props
 * @returns {JSX.Element}
 */
export function Strong(props: React.HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <strong className="font-black text-black dark:text-white" {...props}>
      {props.children}
    </strong>
  );
}

/**
 * B component
 * @param {React.HTMLAttributes<HTMLElement>} props
 * @returns {JSX.Element}
 */
export function B(props: React.HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <b className="font-black text-black dark:text-white" {...props}>
      {props.children}
    </b>
  );
}

/**
 * Img component
 * @param {React.ImgHTMLAttributes<HTMLImageElement>} props
 * @returns {JSX.Element}
 */
export function Img(
  props: React.ImgHTMLAttributes<HTMLImageElement>
): JSX.Element {
  // eslint-disable-next-line react/prop-types
  return <img className="my-6 rounded-sm mx-auto" {...props} alt={props.alt} />;
}

/**
 * MdLink component
 * @param {React.AnchorHTMLAttributes<HTMLAnchorElement>} props
 * @returns {JSX.Element}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MdLink(props: any): JSX.Element {
  return (
    <Link
      to={props.href}
      target="_blank"
      rel="noreferrer"
      prefetch="intent"
      className="text-blue-700"
      {...props}
    >
      {props.children}
    </Link>
  );
}

/**
 * CodeBlock component
 * @param {React.HTMLAttributes<HTMLElement>} props
 * @returns {JSX.Element}
 */
export function CodeBlock(
  props: React.HTMLAttributes<HTMLElement>
): JSX.Element {
  const { className, children, ...rest } = props;
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  function handleCopied() {
    window.navigator.clipboard.writeText(children as string);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
    });
    window.setTimeout(() => {
      setCopied(false);
    }, 3000);
  }

  let language: string | null = null;
  if (className) {
    language = className.replace(/language-/, "");
  }

  return language ? (
    <div className="relative mb-6 mt-10">
      <pre
        className={cn("hljs rouned-md! text-md p-4 overflow-x-auto", className)}
        {...rest}
      >
        {language ? (
          <Badge className="font-light text-gray-100 dark:text-cyan-700 bg-slate-800 dark:bg-slate-200 p-0 px-1 rounded-b-none  absolute -top-4 right-0">
            {language}
          </Badge>
        ) : null}

        <Button
          className="text-slate-300 text-xs absolute right-0 top-0 rounded-tl-none rounded-br-none"
          variant="ghost"
          size="sm"
          onClick={handleCopied}
        >
          {copied ? (
            <>
              <IoCheckmarkDone className="mr-2 h-3 w-3" /> Copied!
            </>
          ) : (
            <>
              <MdOutlineContentCopy className="mr-2 h-3 w-3" /> Copy
            </>
          )}
        </Button>

        <code
          className={language}
          dangerouslySetInnerHTML={{
            __html:
              typeof children === "string"
                ? highlightjs.highlight(children.trim(), {
                    language,
                  }).value
                : "",
          }}
          {...rest}
        />
      </pre>
    </div>
  ) : (
    <code
      className={cn(
        "text-sm px-1 rounded-md bg-slate-300 dark:bg-slate-600",
        className
      )}
      {...rest}
    >
      {children}
    </code>
  );
}
