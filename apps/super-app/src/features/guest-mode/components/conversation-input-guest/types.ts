export interface TConversationInputGuestProps {
  guestUserInput: string;
  onSubmit?: () => Promise<void>;
}

export type TCharacterCountStatus = "success" | "error";
