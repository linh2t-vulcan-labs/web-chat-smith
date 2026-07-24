import { Avatar } from "radix-ui";

import { Badge } from "@/components/badge";
import { SVGIcon } from "@/components/svg-icon";

import type { TMetadataCardProps } from "./types";

export default function MetadataCard(props: TMetadataCardProps) {
  const {
    title,
    description,
    position,
    logoUrl,
    url,
    isShowPosition = true,
  } = props;

  const urlStructure = new URL(url);
  const { hostname } = urlStructure;

  return (
    <a
      href={urlStructure.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/metadata"
      aria-label={title}
    >
      <div className="p-medium-1.5 gap-y-small-0.75 rounded-rounded hover:bg-surface-general-soft flex w-full flex-col">
        <div className="gap-small-0.5 inline-flex size-full flex-col">
          <div className="gap-medium-1.5 inline-flex items-start">
            <h3 className="text-footnoteM-highlight text-text-general-secondary line-clamp-2 flex-1">
              {title}
            </h3>
            {isShowPosition && (
              <Badge
                type="dot"
                size="small"
                className="group-hover/metadata:bg-neutral-150! group-hover/metadata:text-text-general-inverse!"
              >
                {position}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-footnoteS-neutral text-text-general-tertiary line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <div className="gap-x-small-0.75 inline-flex w-full items-center">
          <Avatar.Root>
            <Avatar.Image
              src={logoUrl || "/icons/filled/link-default.svg"}
              width={12}
              height={12}
              alt={url}
            />
            <Avatar.Fallback>
              <SVGIcon
                src="/icons/filled/link-default.svg"
                width={12}
                height={12}
              />
            </Avatar.Fallback>
          </Avatar.Root>
          <p className="text-footnoteS-neutral text-text-general-tertiary">
            {hostname}
          </p>
        </div>
      </div>
    </a>
  );
}
