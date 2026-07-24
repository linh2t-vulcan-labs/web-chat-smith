export type TPlanStatusTagColor = "green" | "red" | "neutral";

export type TPlanStatusTagProps = Readonly<{
  color: TPlanStatusTagColor;
  label: string;
  className?: string;
  size?: "sm" | "md";
}>;
