import { useTranslations } from "next-intl";

import { ImageLimitAlert } from "@/components/image-limit-alert";
import { EConversationMode } from "@/core/models/conversation";
import { EAIValueModel } from "@/core/models/model";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useConversationState } from "@/store/conversation/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import FileDisplayZone from "../conversation-input/file-display-zone";

const renderFootnoteSpan = (chunks: React.ReactNode) => (
  <span className="text-footnoteS-highlight">{chunks}</span>
);

const FileAttachmentList = () => {
  const isDesktop = useMediaQuery("md");
  // Conversation state
  const selectedAIArt = useConversationState((state) => state.selectedAIArt);
  const isOpenImageLimitAlert = useConversationState(
    (state) => state.isOpenImageLimitAlert
  );
  const conversationMode = useConversationState((state) => state.mode);
  const selectedImageModel = useConversationState(
    (state) => state.selectedImageModel
  );
  const setIsOpenImageLimitAlert = useConversationState(
    (state) => state.setIsOpenImageLimitAlert
  );
  const conversationT = useTranslations("conversationPage");

  // Variables
  const isAIArtMode = conversationMode === EConversationMode.AI_ART;
  const isGPTImageModel = selectedImageModel.value === EAIValueModel.GPT_Image;

  const renderDescription = () => {
    if (isGPTImageModel) {
      return conversationT.rich("createImage.singleImage.desc", {
        span: renderFootnoteSpan,
      });
    }

    return conversationT.rich("createImage.reachLimitStyle.desc", {
      maxImage: selectedAIArt.maxImages,
      span: renderFootnoteSpan,
    });
  };

  return (
    <ImageLimitAlert
      open={isOpenImageLimitAlert && isAIArtMode}
      title={conversationT("createImage.reachLimitStyle.title")}
      description={renderDescription()}
      imageUrl={isGPTImageModel ? null : selectedAIArt.image}
      side={isDesktop ? "right" : "top"}
      onClose={() => setIsOpenImageLimitAlert(false)}
    >
      <div
        className={compositeStyles({
          "size-fit": isAIArtMode,
        })}
      >
        <FileDisplayZone
          className={compositeStyles({
            "pr-0!": isAIArtMode,
          })}
        />
      </div>
    </ImageLimitAlert>
  );
};

export default FileAttachmentList;
