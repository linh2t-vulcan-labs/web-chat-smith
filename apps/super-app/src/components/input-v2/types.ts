export type THandleChangeInput = (
  e: React.ChangeEvent<HTMLInputElement>
) => void;
export type THandleChangeTextarea = (
  e: React.ChangeEvent<HTMLTextAreaElement>
) => void;

export interface TCommonInputProps {
  id?: string;
  className?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export type TInputInlineV2Props = Readonly<
  TCommonInputProps & {
    type: "inline";
    suffix?: React.ReactNode;
    prefix?: React.ReactNode;
    onChange?: THandleChangeInput;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  }
>;

export type TInputMultipleLineV2Props = Readonly<
  TCommonInputProps & {
    type: "multiple";
    onChange?: THandleChangeTextarea;
    rows?: number;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  }
>;

export type InputV2Props = Readonly<
  (TInputInlineV2Props | TInputMultipleLineV2Props) & {
    id?: string;
    isHasWrapper?: boolean;
    wrapperClassName?: string;
  }
>;

export type TWrapperInputProps = Readonly<{
  className?: string;
  children?: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}>;
