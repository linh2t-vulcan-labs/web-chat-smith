import type { CSSProperties } from "react";

export type TTailwindStyle = string;
export type TNumberStyle = number;
export type TInlineCSSStyle = CSSProperties;

export type TSupportedTypes = TTailwindStyle | TNumberStyle | TInlineCSSStyle;

export type TDefaultSizes = "small" | "base" | "medium" | "large";

export type TSizes<T = ""> = TDefaultSizes | T;

export type TSizePropStyles<
  S extends TSupportedTypes = TTailwindStyle,
  T = "base",
> = Map<TSizes<T>, S>;
export type TContentType = "conversation" | "assistant" | "faq";

export type TPurchaseSource =
  | "ai_model"
  | "free_turn"
  | "main"
  | "attach_file"
  | "assistant-writing"
  | "deep_research"
  | "ai_art"
  | "ai_art_edit"
  | "web_search"
  | "guest"
  | "top_block"
  | "bottom_block"
  | "first_login"
  | "banner"
  | "expired_popup"
  | "user_menu";
