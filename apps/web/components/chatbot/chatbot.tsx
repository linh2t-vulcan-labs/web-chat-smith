"use client";

import type { AttachmentData } from "@cs/ui/components/ai-elements/attachments";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@cs/ui/components/ai-elements/attachments";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@cs/ui/components/ai-elements/conversation";
import {
  Message,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
} from "@cs/ui/components/ai-elements/message";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@cs/ui/components/ai-elements/model-selector";
import type { PromptInputMessage } from "@cs/ui/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@cs/ui/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@cs/ui/components/ai-elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@cs/ui/components/ai-elements/sources";
import { SpeechInput } from "@cs/ui/components/ai-elements/speech-input";
import {
  Suggestion,
  Suggestions,
} from "@cs/ui/components/ai-elements/suggestion";
import { toast } from "@cs/ui/components/shadcn/toast";
import { CheckIcon, GlobeIcon } from "lucide-react";
import { useState } from "react";

import { useMockChatConversation } from "./use-mock-chat-conversation";

const models = [
  {
    chef: "OpenAI",
    chefSlug: "openai",
    id: "gpt-4o",
    name: "GPT-4o",
    providers: ["openai", "azure"],
  },
  {
    chef: "OpenAI",
    chefSlug: "openai",
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    providers: ["openai", "azure"],
  },
  {
    chef: "Anthropic",
    chefSlug: "anthropic",
    id: "claude-opus-4-20250514",
    name: "Claude 4 Opus",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    chef: "Anthropic",
    chefSlug: "anthropic",
    id: "claude-sonnet-4-20250514",
    name: "Claude 4 Sonnet",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    chef: "Google",
    chefSlug: "google",
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    providers: ["google"],
  },
];

const suggestions = [
  "What are the latest trends in AI?",
  "How does machine learning work?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "How to optimize database queries?",
  "What is the difference between SQL and NoSQL?",
  "Explain cloud computing basics",
];

const chefs = ["OpenAI", "Anthropic", "Google"];

const modelsByChef = new Map<string, (typeof models)[0][]>();
for (const chefName of chefs) {
  modelsByChef.set(chefName, []);
}
for (const m of models) {
  modelsByChef.get(m.chef)?.push(m);
}

const AttachmentItem = ({
  attachment,
  onRemove,
}: {
  attachment: AttachmentData;
  onRemove: (id: string) => void;
}) => (
  <Attachment data={attachment} onRemove={() => onRemove(attachment.id)}>
    <AttachmentPreview />
    <AttachmentRemove />
  </Attachment>
);

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  const handleRemove = (id: string) => {
    attachments.remove(id);
  };

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem
          attachment={attachment}
          key={attachment.id}
          onRemove={handleRemove}
        />
      ))}
    </Attachments>
  );
};

const SuggestionItem = ({
  suggestion,
  onClick,
}: {
  suggestion: string;
  onClick: (suggestion: string) => void;
}) => (
  <Suggestion onClick={() => onClick(suggestion)} suggestion={suggestion} />
);

const ModelItem = ({
  m,
  isSelected,
  onSelect,
}: {
  m: (typeof models)[0];
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => (
  <ModelSelectorItem onSelect={() => onSelect(m.id)} value={m.id}>
    <ModelSelectorLogo provider={m.chefSlug} />
    <ModelSelectorName>{m.name}</ModelSelectorName>
    <ModelSelectorLogoGroup>
      {m.providers.map((provider) => (
        <ModelSelectorLogo key={provider} provider={provider} />
      ))}
    </ModelSelectorLogoGroup>
    {isSelected ? (
      <CheckIcon className="ml-auto size-4" />
    ) : (
      <div className="ml-auto size-4" />
    )}
  </ModelSelectorItem>
);

/** The message-picker control in the prompt footer: trigger showing the selected model's logo/name, plus the searchable dropdown grouped by chef. */
const ChatModelPicker = ({
  model,
  open,
  onOpenChange,
  onSelect,
}: {
  model: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (modelId: string) => void;
}) => {
  const selectedModelData = models.find((m) => m.id === model);

  return (
    <ModelSelector onOpenChange={onOpenChange} open={open}>
      <ModelSelectorTrigger
        render={
          <PromptInputButton>
            {selectedModelData?.chefSlug && (
              <ModelSelectorLogo provider={selectedModelData.chefSlug} />
            )}
            {selectedModelData?.name && (
              <ModelSelectorName>{selectedModelData.name}</ModelSelectorName>
            )}
          </PromptInputButton>
        }
      />
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {chefs.map((chef) => (
            <ModelSelectorGroup heading={chef} key={chef}>
              {modelsByChef.get(chef)?.map((m) => (
                <ModelItem
                  isSelected={model === m.id}
                  key={m.id}
                  m={m}
                  onSelect={onSelect}
                />
              ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
};

const hasSubmittableContent = (message: PromptInputMessage): boolean =>
  Boolean(message.text) || Boolean(message.files?.length);

const notifyAttachmentsAttached = (count: number) => {
  toast.add({
    title: "Files attached",
    description: `${count} file(s) attached to message`,
  });
};

type ChatStatus = ReturnType<typeof useMockChatConversation>["status"];

/** Nothing to send yet, or a reply is still streaming in. */
const isChatSubmitDisabled = (text: string, status: ChatStatus): boolean => {
  if (status === "streaming") {
    return true;
  }
  return !(text.trim() || status);
};

type ChatMessage = ReturnType<typeof useMockChatConversation>["messages"][0];

/** One conversation turn: source list, reasoning, and versioned content, wrapped in a branch selector when the turn has multiple versions. */
const ChatMessageBranch = ({
  message: { versions, ...message },
}: {
  message: ChatMessage;
}) => (
  <MessageBranch defaultBranch={0}>
    <MessageBranchContent>
      {versions.map((version) => (
        <Message from={message.from} key={`${message.key}-${version.id}`}>
          <div>
            {message.sources?.length && (
              <Sources>
                <SourcesTrigger count={message.sources.length} />
                <SourcesContent>
                  {message.sources.map((source) => (
                    <Source
                      href={source.href}
                      key={source.href}
                      title={source.title}
                    />
                  ))}
                </SourcesContent>
              </Sources>
            )}
            {message.reasoning && (
              <Reasoning duration={message.reasoning.duration}>
                <ReasoningTrigger />
                <ReasoningContent>{message.reasoning.content}</ReasoningContent>
              </Reasoning>
            )}
            <MessageContent>
              <MessageResponse>{version.content}</MessageResponse>
            </MessageContent>
          </div>
        </Message>
      ))}
    </MessageBranchContent>
    {versions.length > 1 && (
      <MessageBranchSelector>
        <MessageBranchPrevious />
        <MessageBranchPage />
        <MessageBranchNext />
      </MessageBranchSelector>
    )}
  </MessageBranch>
);

export const Chatbot = () => {
  const [model, setModel] = useState<string>(models[0]?.id || "");
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [text, setText] = useState<string>("");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const { messages, sendMessage, status } = useMockChatConversation();

  const handleSubmit = (message: PromptInputMessage) => {
    if (!hasSubmittableContent(message)) {
      return;
    }

    const attachmentCount = message.files?.length ?? 0;
    if (attachmentCount > 0) {
      notifyAttachmentsAttached(attachmentCount);
    }

    sendMessage(message.text || "Sent with attachments");
    setText("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleTranscriptionChange = (transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const toggleWebSearch = () => {
    setUseWebSearch((prev) => !prev);
  };

  const handleModelSelect = (modelId: string) => {
    setModel(modelId);
    setModelSelectorOpen(false);
  };

  const isSubmitDisabled = isChatSubmitDisabled(text, status);

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden">
      <Conversation>
        <ConversationContent>
          {messages.map((message) => (
            <ChatMessageBranch key={message.key} message={message} />
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="grid shrink-0 gap-4 pt-4">
        <Suggestions className="px-4">
          {suggestions.map((suggestion) => (
            <SuggestionItem
              key={suggestion}
              onClick={handleSuggestionClick}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>
        <div className="w-full px-4 pb-4">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachmentsDisplay />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea onChange={handleTextChange} value={text} />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <SpeechInput
                  className="shrink-0"
                  onTranscriptionChange={handleTranscriptionChange}
                  size="icon-sm"
                  variant="ghost"
                />
                <PromptInputButton
                  onClick={toggleWebSearch}
                  variant={useWebSearch ? "default" : "ghost"}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
                <ChatModelPicker
                  model={model}
                  onOpenChange={setModelSelectorOpen}
                  onSelect={handleModelSelect}
                  open={modelSelectorOpen}
                />
              </PromptInputTools>
              <PromptInputSubmit disabled={isSubmitDisabled} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};
