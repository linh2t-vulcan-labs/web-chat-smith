import type { ChangeEvent, KeyboardEvent } from "react";

export interface TThreadTitleProps {
  className?: string;
  isEdit: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}
