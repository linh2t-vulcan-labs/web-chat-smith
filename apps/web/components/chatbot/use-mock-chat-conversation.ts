import { useRef, useState } from "react";

import type { MessageType } from "./mock-conversation-data";
import {
  delay,
  initialMessages,
  mockResponses,
} from "./mock-conversation-data";

/** How long to wait before the mock assistant reply starts streaming in. */
const ASSISTANT_REPLY_DELAY_MS = 500;

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

/**
 * Owns the demo chatbot's mock conversation state: the message list, the
 * send status, and the word-by-word "streaming" of a random canned assistant
 * reply. Extracted out of `Chatbot` so that component only has to wire up
 * `sendMessage`/`status`/`messages`, not the streaming mechanics themselves.
 */
export const useMockChatConversation = () => {
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const stopRequestedRef = useRef(false);
  const pendingReplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const updateMessageContent = (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.versions.some((v) => v.id === messageId)) {
          return {
            ...msg,
            versions: msg.versions.map((v) =>
              v.id === messageId ? { ...v, content: newContent } : v
            ),
          };
        }
        return msg;
      })
    );
  };

  const streamResponse = async (messageId: string, content: string) => {
    setStatus("streaming");

    const words = content.split(" ");
    let currentContent = "";

    // Sequential, not `Promise.all` — each word's delay is independently
    // randomized, so racing them let later words resolve (and append)
    // before earlier ones, scrambling the reveal order.
    for (const [i, word] of words.entries()) {
      if (stopRequestedRef.current) {
        break;
      }
      // eslint-disable-next-line no-await-in-loop -- each word must reveal after the previous one, not concurrently
      await delay(Math.random() * 100 + 50);
      if (stopRequestedRef.current) {
        break;
      }
      currentContent += (i > 0 ? " " : "") + word;
      updateMessageContent(messageId, currentContent);
    }

    stopRequestedRef.current = false;
    setStatus("ready");
  };

  const addUserMessage = (content: string) => {
    const userMessage: MessageType = {
      from: "user",
      key: `user-${Date.now()}`,
      versions: [
        {
          content,
          id: `user-${Date.now()}`,
        },
      ],
    };

    setMessages((prev) => [...prev, userMessage]);

    pendingReplyTimeoutRef.current = setTimeout(() => {
      pendingReplyTimeoutRef.current = null;

      if (stopRequestedRef.current) {
        stopRequestedRef.current = false;
        setStatus("ready");
        return;
      }

      const assistantMessageId = `assistant-${Date.now()}`;
      const randomResponse =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];

      const assistantMessage: MessageType = {
        from: "assistant",
        key: `assistant-${Date.now()}`,
        versions: [
          {
            content: "",
            id: assistantMessageId,
          },
        ],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      streamResponse(assistantMessageId, randomResponse as string);
    }, ASSISTANT_REPLY_DELAY_MS);
  };

  /** Marks the conversation as "submitted" and appends the user's message. */
  const sendMessage = (content: string) => {
    stopRequestedRef.current = false;
    setStatus("submitted");
    addUserMessage(content);
  };

  /** Cancels the pending or in-flight assistant reply and returns to "ready" immediately. */
  const stopMessage = () => {
    if (pendingReplyTimeoutRef.current) {
      clearTimeout(pendingReplyTimeoutRef.current);
      pendingReplyTimeoutRef.current = null;
      setStatus("ready");
      return;
    }
    stopRequestedRef.current = true;
  };

  return { messages, sendMessage, status, stopMessage };
};
