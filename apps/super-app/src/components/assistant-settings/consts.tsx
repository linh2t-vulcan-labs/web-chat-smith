import Image from "next/image";

import type { TButtonOption } from "@/components/button-group/types";

export const lengthOptions: TButtonOption[] = [
  {
    icon: (
      <Image
        src="/icons/documents/document-green.svg"
        width={16}
        height={16}
        alt="short document"
      />
    ),
    label: "length.short",
    value: "short",
  },
  {
    icon: (
      <Image
        src="/icons/documents/document-yellow.svg"
        width={16}
        height={16}
        alt="medium document"
      />
    ),
    label: "length.medium",
    value: "medium",
  },
  {
    icon: (
      <Image
        src="/icons/documents/document-pink.svg"
        width={16}
        height={16}
        alt="long document"
      />
    ),
    label: "length.long",
    value: "long",
  },
];

export const toneOptions: TButtonOption[] = [
  {
    icon: <span className="size-[16px]">😊</span>,
    label: "tone.formal",
    value: "formal",
  },
  {
    icon: <span className="size-[16px]">😝</span>,
    label: "tone.informal",
    value: "informal",
  },
  {
    icon: <span className="size-[16px]">🤩</span>,
    label: "tone.optimistic",
    value: "optimistic",
  },
  {
    icon: <span className="size-[16px]">😣</span>,
    label: "tone.worried",
    value: "worried",
  },
  {
    icon: <span className="size-[16px]">🤗</span>,
    label: "tone.friendly",
    value: "friendly",
  },
  {
    icon: <span className="size-[16px]">🤔</span>,
    label: "tone.curious",
    value: "curious",
  },
  {
    icon: <span className="size-[16px]">👍</span>,
    label: "tone.assertive",
    value: "assertive",
  },
  {
    icon: <span className="size-[16px]">👏</span>,
    label: "tone.encouraging",
    value: "encouraging",
  },
  {
    icon: <span className="size-[16px]">😲</span>,
    label: "tone.surprised",
    value: "surprised",
  },
  {
    icon: <span className="size-[16px]">👥</span>,
    label: "tone.cooperative",
    value: "cooperative",
  },
];

export const techniqueOptions: TButtonOption[] = [
  {
    label: "technique.none",
    value: "none",
  },
  {
    label: "technique.framework",
    value: "5 Basic Objections framework",
  },
  {
    label: "technique.aida",
    value: "AIDA Copywriting",
  },
  {
    label: "technique.pas",
    value: "PAS Copywriting",
  },
  {
    label: "technique.webinar",
    value: "Perfect webinar formula by Russell Brunson",
  },
  {
    label: "technique.pastor",
    value: "PASTOR framework",
  },
];
