"use client";

import { useEffect, useState } from "react";

import type { PromptInputMessage } from "@/features/suite/components/ui/ai-elements/prompt-input";

import { errorToast } from "../error-toast";

interface UseSuitePromptInputProps {
  hasUsecaseChip: boolean;
}

const handleError = (err: { code: string }) => {
  if (err.code === "accept") {
    errorToast("Unsupported file type", "Please upload a supported file type");
  }
  if (err.code === "max_file_size") {
    errorToast(
      "File size exceeds the 20MB limit",
      "Please upload a smaller file"
    );
  }
  if (err.code === "max_files") {
    errorToast(
      "Upload limit reached",
      "You can upload up to 3 images per message"
    );
  }
};

export function useSuitePromptInput({
  hasUsecaseChip,
}: UseSuitePromptInputProps) {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    if (hasUsecaseChip) {
      return;
    }

    // oxlint-disable-next-line react/react-compiler -- clears usecase-specific fields when the usecase chip is removed, syncing with that external prop toggle, not a render derivation
    setBrandName("");
    setIndustry("");
    setStyle("");
    setType("");
  }, [hasUsecaseChip]);

  const hasAnyLogoField =
    brandName.trim().length > 0 ||
    industry.trim().length > 0 ||
    style.trim().length > 0 ||
    type.trim().length > 0;

  const getSubmitMessage = (message: PromptInputMessage) => {
    if (!hasUsecaseChip || !hasAnyLogoField) {
      return message;
    }

    const userPrompt = message.text.trim();
    const parts = [
      brandName.trim() && `Brand Name: ${brandName.trim()}`,
      industry.trim() && `Industry: ${industry.trim()}`,
      style.trim() && `Style: ${style.trim()}`,
      type.trim() && `Type: ${type.trim()}`,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      ...message,
      text: userPrompt
        ? `${userPrompt}\n${parts}`
        : `Create a logo with the following details:\n${parts}`,
    };
  };

  return {
    brandName,
    getSubmitMessage,
    handleError,
    hasAnyLogoField,
    industry,
    setBrandName,
    setIndustry,
    setStyle,
    setType,
    style,
    type,
  };
}
