"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

import { Link } from "@/i18n/navigation";
import { omit } from "@/libs/lodash-es";
import { FAQ_URL } from "@/utils/constants/url";

const components: Components = {
  a(props) {
    if (props.href?.startsWith(FAQ_URL)) {
      return (
        <Link href={props.href} className={props.className}>
          {props.children}
        </Link>
      );
    }
    const anchorProps = omit(props, "node");
    return <a {...omit(anchorProps, "children")}>{anchorProps.children}</a>;
  },
};

export function FaqMarkdown({ children }: Readonly<{ children: string }>) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}
