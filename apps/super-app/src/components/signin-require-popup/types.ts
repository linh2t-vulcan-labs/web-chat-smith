import type { ReactElement } from "react";

export interface TCommons {
  content: ReactElement;
  children: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export type TTooltipWrapperProps = TCommons;

export type TPopoverWrapperProps = TCommons;

export type TSigninRequirePopup = {
  mode: "tooltip" | "popover";
} & TCommons;

export interface TSignInRequireProps {
  title: string;
  onSignIn: () => void;
}
