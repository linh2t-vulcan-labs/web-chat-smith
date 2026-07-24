import type { ChangeEvent } from "react";

export type TTypeInput = "inline" | "multiple";

export type HandleChangeInput = (e: ChangeEvent<HTMLInputElement>) => void;
export type HandleChangeTextarea = (
  e: ChangeEvent<HTMLTextAreaElement>
) => void;

export type TInput<T extends TTypeInput> = {
  typeInput: T;
  startIcon?: React.ReactElement;
  inputClassName?: string;
} & TDetailInput<T>;

export interface TDetailInput<T extends TTypeInput> {
  className?: string;
  placeholder?: string;
  name?: string;
  value: string;
  rows?: number;
  id?: string;
  onChange?: T extends "inline" ? HandleChangeInput : HandleChangeTextarea;
}
