import type {
  SuiteCanvasAttachmentMeta,
  SuiteImageSelectionBounds,
  SuitePromptAttachmentSource,
} from "@/features/suite/components/ui/ai-elements/prompt-input";
import type { TSuiteCreativeSSEDirection } from "@/features/suite/types/design-studio";

export interface ThinkingStep {
  label: string;
  description: string;
}

export interface DesignGuidelineSection {
  label: string;
  coreConcept: string;
}

export type SuiteAssetType = "logo" | "poster";

export interface SuitePromptAttachmentSnapshot {
  canvasMeta?: SuiteCanvasAttachmentMeta;
  filename?: string;
  id: string;
  mediaType: string;
  removable?: boolean;
  source: SuitePromptAttachmentSource;
  type: "file";
  uploadId: string;
  uploadStatus: "uploading" | "completed" | "failed";
  url: string;
}

type ConversationItemVariant =
  | { type: "mode-chip"; label: string }
  | {
      type: "user";
      text: string;
      images?: string[];
      imageSelections?: SuiteImageSelectionBounds[];
      promptAttachments?: SuitePromptAttachmentSnapshot[];
      referenceUploadIds?: string[];
    }
  | { type: "bot"; text: string; isAnimating?: boolean }
  | {
      type: "thinking";
      title: string;
      status: "generating" | "complete";
      steps: ThinkingStep[];
      isOpen?: boolean;
      isAnimating?: boolean;
    }
  | {
      type: "generating";
      durationMs: number;
      imageCount: number;
      generationId?: string;
      assetType?: SuiteAssetType;
      message?: string;
      guidelineSections?: DesignGuidelineSection[];
      directions?: TSuiteCreativeSSEDirection[];
    }
  | {
      type: "generated";
      images: (string | null)[];
      imageIds?: string[];
      title: string;
      isCanvasOnly?: boolean;
      generationId?: string;
      assetType?: SuiteAssetType;
    }
  | {
      type: "design-guidelines";
      title: string;
      status: "generating" | "complete";
      sections: DesignGuidelineSection[];
      directions?: TSuiteCreativeSSEDirection[];
      isOpen?: boolean;
      isAnimating?: boolean;
    }
  | {
      type: "error";
      title?: string;
      description?: string;
      generationId?: string;
    };

// `id` is a stable identity assigned by the conversation store on insert.
// Item creators may omit it; the store guarantees it at runtime.
export type ConversationItem = ConversationItemVariant & { id?: string };

export interface SuiteTemplateConversationInput {
  description?: string;
  id: string;
  imageUrl?: string;
  thumbnail?: string;
  title: string;
  type?: string;
}
