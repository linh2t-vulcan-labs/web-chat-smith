export const SUITE_TEMPLATE_GENERATION_ID_PREFIX = "template-";

export const SUITE_TEMPLATE_DEFAULT_MESSAGE =
  "Customize this template to match your brand:\n\n- Change the brand name\n- Adjust colors, icons or style\n- Refine the layout or replace elements\n- Use chat or select any area on the canvas to edit";

export const CONVERSATION_ITEM_TYPE = {
  BOT: "bot",
  DESIGN_GUIDELINES: "design-guidelines",
  ERROR: "error",
  GENERATED: "generated",
  GENERATING: "generating",
  MODE_CHIP: "mode-chip",
  THINKING: "thinking",
  USER: "user",
} as const;

export const INDUSTRY = [
  { label: "Technology", value: "technology" },
  { label: "Finance", value: "finance" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Education", value: "education" },
  { label: "Fashion", value: "fashion" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Beauty", value: "beauty" },
  { label: "Fitness", value: "fitness" },
  { label: "Real Estate", value: "real estate" },
  { label: "Travel", value: "travel" },
] as const;

export const STYLE = [
  { label: "Minimalist", value: "minimalist" },
  { label: "Modern", value: "modern" },
  { label: "Geometric", value: "geometric" },
  { label: "Abstract", value: "abstract" },
  { label: "Vintage", value: "vintage" },
  { label: "Hand-drawn", value: "hand-drawn" },
  { label: "Futuristic", value: "futuristic" },
] as const;

export const TYPE = [
  { label: "Only Text", value: "only text" },
  { label: "Only Graphic", value: "only graphic" },
  { label: "Text & Graphic", value: "text & graphic" },
  { label: "Emblem", value: "emblem" },
  { label: "Mascot", value: "mascot" },
] as const;
