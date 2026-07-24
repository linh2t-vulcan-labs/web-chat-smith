import type {
  TSuiteCreativeHomeSuggestion,
  TSuiteCreativeLogoIndustry,
  TSuiteCreativeLogoStyle,
  TSuiteCreativeLogoType,
} from "../home";

export interface TSuiteCreativeGetHomeSuggestionsResponseDTO {
  suggestions: TSuiteCreativeHomeSuggestion[];
}

export interface TSuiteCreativeGetCreateLogoStructureResponseDTO {
  industries: TSuiteCreativeLogoIndustry[];
  styles: TSuiteCreativeLogoStyle[];
  types: TSuiteCreativeLogoType[];
}
