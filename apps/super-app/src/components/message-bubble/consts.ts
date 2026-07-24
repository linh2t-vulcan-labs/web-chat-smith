import type {
  TMessageBubbleStyles,
  TPositionMessage,
  TPropertiesSupported,
} from "./types";

const leftStyles: TPropertiesSupported = {
  background: "",
  padding: "",
  radius: "",
};

const rightStyles: TPropertiesSupported = {
  background: "bg-surface-conversation-user-default",
  padding: "px-medium-2 py-medium-1.5",
  radius: "rounded-tl-default rounded-tr-default rounded-bl-default",
};

const styles: TMessageBubbleStyles = {
  left: leftStyles,
  right: rightStyles,
};

export const getMessageBubbleStyles = (position: TPositionMessage) => {
  if (position === "left") {
    return styles.left;
  }

  return styles.right;
};
