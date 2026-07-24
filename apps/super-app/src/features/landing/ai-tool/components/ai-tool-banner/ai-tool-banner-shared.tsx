"use client";

import type { FormEvent, ReactNode, SVGProps } from "react";
import { useCallback } from "react";

import styles from "./styles.module.css";

function SendPlaneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      {...props}
    >
      <path
        d="M2.5 16.25L17.5 10L2.5 3.75L2.5 8.75L13.125 10L2.5 11.25V16.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface ActionButtonProps {
  label: string;
  ariaLabel: string;
  onClick?: () => void;
  className?: string;
}

export function AIToolBannerActionButton({
  label,
  ariaLabel,
  onClick,
  className,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={className ?? styles.bannerActionBtn}
      aria-label={ariaLabel}
      disabled={!onClick}
      onClick={onClick}
    >
      <span>{label}</span>
      <SendPlaneIcon className={styles.bannerActionIcon} />
    </button>
  );
}

interface PromptFormProps {
  formId: string;
  className?: string;
  onSubmit: () => void;
  children: ReactNode;
}

export function AIToolBannerPromptForm({
  formId,
  className,
  onSubmit,
  children,
}: PromptFormProps) {
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit();
    },
    [onSubmit]
  );

  return (
    <form
      id={formId}
      className={className}
      action="#"
      method="post"
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
}
