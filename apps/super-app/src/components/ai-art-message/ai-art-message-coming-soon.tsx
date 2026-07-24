import { ButtonV2 } from "@/components/button-v2";
import MessageReachLimit from "@/components/message-reach-limit/message-reach-limit";
import { GAEvents } from "@/libs/ga/events";
import { useConversationHandler } from "@/store/conversation-handler/hooks";

function AIArtComingSoonMessage() {
  const handleRetryMessage = useConversationHandler(
    (state) => state.handleRetrySend
  );

  const title = "Image-to-image generation is coming soon!";
  const description =
    "Let try generate an image with text inputted - it's easy to any fun";

  const handleClickRetry = async () => {
    GAEvents.ChatArtSendTryNow();
    await handleRetryMessage();
  };

  return (
    <MessageReachLimit
      title={title}
      description={description}
      purchaseSource="free_turn"
      actionNode={
        <div>
          <ButtonV2
            color="secondary"
            size="xxs"
            className="!text-footnoteM-highlight"
            onClick={handleClickRetry}
          >
            Try now
          </ButtonV2>
        </div>
      }
    />
  );
}

export default AIArtComingSoonMessage;
