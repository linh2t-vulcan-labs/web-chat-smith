import type {
  ConversationItem,
  SuiteTemplateConversationInput,
} from "@/features/suite/types/conversation";
import {
  SUITE_TEMPLATE_DEFAULT_MESSAGE,
  SUITE_TEMPLATE_GENERATION_ID_PREFIX,
} from "@/features/suite/utils/constants/conversation";

export const getTemplateConversation = (
  template: SuiteTemplateConversationInput
): ConversationItem[] => {
  const previewImageUrl = template.imageUrl ?? template.thumbnail;

  return [
    {
      label: template.type ?? "template",
      type: "mode-chip",
    },
    {
      text: template.description ?? SUITE_TEMPLATE_DEFAULT_MESSAGE,
      type: "bot",
    },
    {
      type: "generated",
      title: template.title,
      images: previewImageUrl ? [previewImageUrl] : [],
      // Carry template.id as the canvas card's imageId so that drawing/editing the
      // template preview sends it as target_image_id (the template image has no separate
      // image id). Without this, card.imageId is undefined and the edit submit throws.
      imageIds: previewImageUrl ? [template.id] : [],
      isCanvasOnly: true,
      generationId: `${SUITE_TEMPLATE_GENERATION_ID_PREFIX}${template.id}`,
      assetType: "logo",
    },
  ];
};
