export type THelpCenterItemProps = Readonly<{
  title: string;
  description: string;
  icon?: string | React.ReactNode;
  link?: string;
  enabled?: boolean;
  onClick?: () => void;
}>;
