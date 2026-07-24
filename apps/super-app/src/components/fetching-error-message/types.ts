export interface TFetchingErrorMessageProps {
  text: string;
  align?: "center" | "left";
  size?: "small" | "medium";
  onRetry?: () => void;
}
