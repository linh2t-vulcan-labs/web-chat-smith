import type { PropsWithChildren } from "react";

import type { AIModelItem } from "@/core/models/model";
import type { TMessageTemp } from "@/features/guest-mode/models/conversation";

export type TStatusGuestConversation =
  | "idle"
  | "loading"
  | "generating"
  | "submitted"
  | "error"
  | "reachedLimit";

export interface TGuestConversationState {
  status: TStatusGuestConversation;
  temporaryMessageForStreaming?: TMessageTemp | null;
  messages: TMessageTemp[];
  error?: unknown;
  isNew?: boolean;
}

export type TGuestConversationStates = Record<string, TGuestConversationState>;

export interface TGuestStoreState {
  deviceId: string | null;
  sessionId: string | null;
  anonId: string | null;
  accessToken: string | null;
  isShowCaptchaModal: boolean;
  // Data when bootstrap guest session
  csrfToken: string;
  nonce: string;
  isVerifiedCaptcha: boolean;
  isOpenGuestConfirmModal: boolean;
  // Error handling
  verificationError: string | null;
  bootstrapError: string | null;

  //Conversation related
  selectedModel: AIModelItem;
  guestUserInput: string;
  selectedId?: string; // selected conversation id
  conversationState: TGuestConversationState;
  temporaryMessageForStreaming: TMessageTemp | null;
  isTyping: boolean;
  isFetching?: boolean;

  isOpenPromoteSignIn: boolean;
}

export interface TGuestStoreActions {
  setDeviceId: (deviceId: string) => void;
  setSessionId: (sessionId: string) => void;
  setAnonId: (anonId: string) => void;
  setAccessToken: (accessToken: string) => void;
  setCsrfToken: (csrfToken: string) => void;
  setNonce: (nonce: string) => void;
  setIsShowCaptchaModal: (isShowCaptchaModal: boolean) => void;
  setIsVerifiedCaptcha: (isOpen: boolean) => void;
  setIsOpenGuestConfirmModal: (isOpen: boolean) => void;
  setGuestUserInput: (guestUserInput: string) => void;
  setSelectedModel: (model: AIModelItem) => void;
  resetStore: () => void;
  setVerificationError: (error: string | null) => void;
  setBootstrapError: (error: string | null) => void;

  //Conversation related
  setSelectedId: (selectedId: string) => void;
  setConversationState: (newState: Partial<TGuestConversationState>) => void;
  setIsTyping: (isTyping: boolean) => void;
  setIsFetching: (isFetching: boolean) => void;

  setIsOpenPromoteSignIn: (isOpen: boolean) => void;
}

export type TGuestStore = TGuestStoreState & TGuestStoreActions;

export interface TGuestStoreCreateOptions {
  isShowCaptchaModal?: boolean;
}

export type TGuestProviderProps = Readonly<
  PropsWithChildren & {
    options: TGuestStoreCreateOptions;
  }
>;
