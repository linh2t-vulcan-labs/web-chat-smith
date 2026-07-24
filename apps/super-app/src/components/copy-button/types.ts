export interface TCopyButtonProps {
  content: string;
  delay?: number;
  isShowToast?: boolean;
  onCopy?: (content: string) => void;
}
