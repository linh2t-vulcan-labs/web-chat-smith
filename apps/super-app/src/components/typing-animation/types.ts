export interface TSuggestionCard {
  id: string;
  key: string; // key to use translation
  type: "image" | "icon";
  actionType:
    | "image_to_image"
    | "text_to_image"
    | "info_query"
    | "fun_social"
    | "deep_research";
  url: string;
  title: string;
  prompt: string;
  isEnabled: boolean;
}
