import {
  FaClipboardCheck,
  FaFacebookF,
  FaLinkedinIn,
  FaRedditAlien,
  FaRegCopy,
  FaShare,
  FaXTwitter,
} from "react-icons/fa6";
import { Separator } from "~/components/ui/separator";
import {
  TwitterShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  RedditShareButton,
} from "react-share";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/use-toast";
import React from "react";

export function Share({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = React.useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Article link copied." });
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  }

  return (
    <div className="flex flex-wrap justify-between gap-6">
      <div className="flex gap-4 items-center mx-auto">
        <FaShare className="text-sky-600" size={25} />{" "}
        <span className="text-lg">Share this article with friends.</span>
      </div>
      <Separator orientation="vertical" />
      <div className="flex gap-8 mx-auto">
        <TwitterShareButton url={url} title={title}>
          <FaXTwitter size={25} />
        </TwitterShareButton>
        <FacebookShareButton url={url} title={title}>
          <FaFacebookF size={25} />
        </FacebookShareButton>
        <LinkedinShareButton url={url} title={title}>
          <FaLinkedinIn size={25} />
        </LinkedinShareButton>
        <RedditShareButton url={url} title={title}>
          <FaRedditAlien size={25} />
        </RedditShareButton>
        <Button
          variant={"ghost"}
          className="p-0 m-0 hover:bg-inherit hover:text-black"
          onClick={handleCopy}
        >
          {copied ? <FaClipboardCheck size={25} /> : <FaRegCopy size={25} />}
        </Button>
      </div>
    </div>
  );
}
