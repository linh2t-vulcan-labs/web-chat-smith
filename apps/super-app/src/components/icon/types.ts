import type { buildTimeIcons } from "./const";

type TIconName = keyof typeof buildTimeIcons;

export type TIconProps = React.SVGProps<SVGSVGElement> & {
  name: TIconName;

  /**
   * Size of the icon (width and height)
   * @default 24
   */
  size?: number;

  /**
   * Additional class names
   */
  className?: string;
};
