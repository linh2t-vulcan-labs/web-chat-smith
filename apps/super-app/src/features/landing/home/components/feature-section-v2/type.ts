export interface FeatureCardProps {
  title: string;
  description: string;
  btnText: string;
  icon?: string;
  horizontalCentered?: boolean;
  btnId?: string;
  onButtonClick?: () => void;
}
