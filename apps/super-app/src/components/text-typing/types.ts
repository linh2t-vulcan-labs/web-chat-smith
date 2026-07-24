export interface TTextTypingProps {
  stop?: boolean;
  text: string;
  delay: number;
  infinite?: boolean;
  onDone?: () => void;
}
