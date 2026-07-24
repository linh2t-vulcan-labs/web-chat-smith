import Image from "next/image";
import { Avatar } from "radix-ui";
import React from "react";

import { formatReadableDate } from "@/utils/commons/date-time";

import { DEFAULT_AUTHOR_IMAGE, DEFAULT_AUTHOR_NAME } from "./constants";

type TFooterBlogProps = Readonly<{
  authorImage: string;
  authorName: string;
  publishedAt: string;
}>;

const FooterBlog = React.memo((props: TFooterBlogProps) => {
  const {
    authorImage = DEFAULT_AUTHOR_IMAGE,
    authorName = DEFAULT_AUTHOR_NAME,
    publishedAt,
  } = props;

  return (
    <>
      <Avatar.Root className="flex size-[32px] items-center justify-center">
        <Avatar.Image
          alt={authorName}
          className="rounded-circle object-cover"
          src={authorImage || DEFAULT_AUTHOR_IMAGE}
          width={32}
          height={32}
          asChild
        >
          <Image
            src={authorImage || DEFAULT_AUTHOR_IMAGE}
            alt={authorName}
            width={32}
            height={32}
          />
        </Avatar.Image>
        <Avatar.Fallback className="size-full text-center text-bodyM-neutral text-text-general-primary">
          {authorName?.charAt(0)}
        </Avatar.Fallback>
      </Avatar.Root>
      <div className="flex flex-col">
        <div className="text-footnoteM-neutral text-text-general-secondary">
          {authorName}
        </div>
        <span className="text-footnoteS-neutral text-text-general-tertiary">
          {formatReadableDate(publishedAt)}
        </span>
      </div>
    </>
  );
});

FooterBlog.displayName = "FooterBlog";

export default FooterBlog;
