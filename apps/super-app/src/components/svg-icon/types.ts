export interface TSVGIconProps {
  src: string;
  width: number;
  height: number;
  className?: string;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: (e?: React.MouseEvent<HTMLOrSVGElement>) => void;
}
