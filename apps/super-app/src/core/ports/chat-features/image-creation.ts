import type {
  EAIART_STYLE,
  EAIART_TYPE,
} from "@/core/models/chat-features/image-creation";
import type { TSelectedAIArt } from "@/core/models/conversation";

export interface TAIArtOptions {
  id: string;
  title: string;
  description: string;
  type: EAIART_TYPE;
  image: string;
  gifImage?: string;
  value: EAIART_STYLE;
  isNew?: boolean;
  isEnabled?: boolean;
  maxImages: number;
}

export interface TImageCreationRepositories {
  getSortedAIArtOptions: (
    options: TAIArtOptions[],
    hasFiles: boolean,
    selectedAIArt: TSelectedAIArt
  ) => TAIArtOptions[];
}
