export type TToastMessageVariant = "success" | "error" | "info" | "warning";

export interface TToastMessageProps {
  title: string;
  description?: string;
  variant?: TToastMessageVariant;
}
