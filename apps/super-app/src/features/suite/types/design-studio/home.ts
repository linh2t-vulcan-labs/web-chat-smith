export type TSuiteCreativeHomeSuggestion =
  | "Design a vintage logo for a coffee shop"
  | "Create a minimalist logo for a skincare brand"
  | "Create a friendly logo for a pet care service"
  | "Design a luxury logo for a perfume brand"
  | "Create a geometric logo for a fitness app";

export type TSuiteCreativeLogoIndustry =
  | "Technology"
  | "Finance"
  | "Healthcare"
  | "Education"
  | "Fashion"
  | "Restaurant"
  | "Beauty"
  | "Fitness"
  | "Real estate"
  | "Travel";

export type TSuiteCreativeLogoStyle =
  | "Minimalist"
  | "Modern"
  | "Geometric"
  | "Abstract"
  | "Vintage"
  | "Hand-drawn"
  | "Futuristic";

export type TSuiteCreativeLogoType =
  | "Only text"
  | "Only graphic"
  | "Text & graphic"
  | "Emblem"
  | "Mascot";

export interface TSuiteCreativeGetHomeSuggestionsResult {
  suggestions: TSuiteCreativeHomeSuggestion[];
}

export interface TSuiteCreativeGetCreateLogoStructureResult {
  industries: TSuiteCreativeLogoIndustry[];
  styles: TSuiteCreativeLogoStyle[];
  types: TSuiteCreativeLogoType[];
}
