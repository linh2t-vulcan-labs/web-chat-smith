"use client";

import { IconCheck } from "@cs/icons/check";
import { IconEarth } from "@cs/icons/earth";
import {
  Artifact,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "@cs/ui/components/ai-elements/artifact";
import type { AttachmentData } from "@cs/ui/components/ai-elements/attachments";
import {
  Attachment,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@cs/ui/components/ai-elements/attachments";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@cs/ui/components/ai-elements/chain-of-thought";
import {
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
} from "@cs/ui/components/ai-elements/checkpoint";
import { CodeBlock } from "@cs/ui/components/ai-elements/code-block";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationActions,
  ConfirmationAction,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@cs/ui/components/ai-elements/confirmation";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@cs/ui/components/ai-elements/conversation";
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationSource,
  InlineCitationText,
} from "@cs/ui/components/ai-elements/inline-citation";
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
import {
  Plan,
  PlanContent,
  PlanDescription,
  PlanHeader,
  PlanTitle,
} from "@cs/ui/components/ai-elements/plan";
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
  Queue,
  QueueItem,
  QueueItemContent,
  QueueItemDescription,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@cs/ui/components/ai-elements/queue";
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
import {
  Task,
  TaskContent,
  TaskItem,
  TaskTrigger,
} from "@cs/ui/components/ai-elements/task";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@cs/ui/components/ai-elements/tool";
import { Button } from "@cs/ui/components/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@cs/ui/components/shadcn/sheet";
import { toast } from "@cs/ui/components/shadcn/toast";
import { useState } from "react";
import type { BundledLanguage } from "shiki";

import type { MessageArtifact } from "./mock-conversation-data";
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
      <IconCheck className="ml-auto size-4" />
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

const isChatGenerating = (status: ChatStatus): boolean =>
  status === "submitted" || status === "streaming";

/**
 * Disabled only when there's nothing to send. While a reply is generating,
 * the button stays enabled so it can act as a Stop control instead of
 * locking up the input.
 */
const isChatSubmitDisabled = (text: string, status: ChatStatus): boolean => {
  if (isChatGenerating(status)) {
    return false;
  }
  return !text.trim();
};

type ChatMessage = ReturnType<typeof useMockChatConversation>["messages"][0];

const ChatAttachments = ({
  attachments,
}: {
  attachments: NonNullable<ChatMessage["attachments"]>;
}) => (
  <Attachments variant="list">
    {attachments.map((attachment) => (
      <Attachment data={{ type: "file", ...attachment }} key={attachment.id}>
        <AttachmentPreview />
        <AttachmentInfo />
      </Attachment>
    ))}
  </Attachments>
);

const ChatChainOfThought = ({
  steps,
}: {
  steps: NonNullable<ChatMessage["chainOfThought"]>;
}) => (
  <ChainOfThought defaultOpen>
    <ChainOfThoughtHeader>Reasoning through the report</ChainOfThoughtHeader>
    <ChainOfThoughtContent>
      {steps.map((step) => (
        <ChainOfThoughtStep
          description={step.description}
          key={step.label}
          label={step.label}
          status={step.status}
        />
      ))}
    </ChainOfThoughtContent>
  </ChainOfThought>
);

const ChatTools = ({ tools }: { tools: NonNullable<ChatMessage["tools"]> }) => (
  <>
    {tools.map((t) => (
      <Tool defaultOpen={t.status === "output-error"} key={t.name}>
        <ToolHeader state={t.status} toolName={t.name} type="dynamic-tool" />
        <ToolContent>
          <ToolInput input={t.parameters} />
          <ToolOutput errorText={t.error} output={t.result} />
        </ToolContent>
      </Tool>
    ))}
  </>
);

const ChatTask = ({ task }: { task: NonNullable<ChatMessage["task"]> }) => (
  <Task>
    <TaskTrigger title={task.title} />
    <TaskContent>
      {task.items.map((item) => (
        <TaskItem key={item}>{item}</TaskItem>
      ))}
    </TaskContent>
  </Task>
);

const ChatPlan = ({ plan }: { plan: NonNullable<ChatMessage["plan"]> }) => (
  <Plan defaultOpen>
    <PlanHeader>
      <div>
        <PlanTitle>{plan.title}</PlanTitle>
        <PlanDescription>{plan.description}</PlanDescription>
      </div>
    </PlanHeader>
    <PlanContent>
      <ol className="list-decimal space-y-1 pl-4 text-sm">
        {plan.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </PlanContent>
  </Plan>
);

const ChatQueue = ({ queue }: { queue: NonNullable<ChatMessage["queue"]> }) => (
  <Queue>
    <QueueSection defaultOpen>
      <QueueSectionTrigger>
        <QueueSectionLabel count={queue.items.length} label={queue.label} />
      </QueueSectionTrigger>
      <QueueSectionContent>
        <QueueList>
          {queue.items.map((item) => {
            const completed = item.status === "completed";
            return (
              <QueueItem key={item.id}>
                <div className="flex items-start gap-2">
                  <QueueItemIndicator completed={completed} />
                  <QueueItemContent completed={completed}>
                    {item.title}
                  </QueueItemContent>
                </div>
                {item.description && (
                  <QueueItemDescription completed={completed}>
                    {item.description}
                  </QueueItemDescription>
                )}
              </QueueItem>
            );
          })}
        </QueueList>
      </QueueSectionContent>
    </QueueSection>
  </Queue>
);

const ChatCitation = ({
  citation,
}: {
  citation: NonNullable<ChatMessage["citation"]>;
}) => (
  <p className="text-muted-foreground text-sm">
    Note:{" "}
    <InlineCitation>
      <InlineCitationText>{citation.text}</InlineCitationText>
      <InlineCitationCard>
        <InlineCitationCardTrigger
          sources={citation.sources.map((source) => source.url)}
        />
        <InlineCitationCardBody>
          <InlineCitationCarousel>
            <InlineCitationCarouselHeader>
              <InlineCitationCarouselIndex />
            </InlineCitationCarouselHeader>
            <InlineCitationCarouselContent>
              {citation.sources.map((source) => (
                <InlineCitationCarouselItem key={source.url}>
                  <InlineCitationSource
                    description={source.description}
                    title={source.title}
                    url={source.url}
                  />
                </InlineCitationCarouselItem>
              ))}
            </InlineCitationCarouselContent>
          </InlineCitationCarousel>
        </InlineCitationCardBody>
      </InlineCitationCard>
    </InlineCitation>
    .
  </p>
);

/** Owns its own approve/deny state — the mock outcome only matters locally, so it doesn't need to live in `Chatbot`. */
const ChatConfirmation = ({
  confirmation,
}: {
  confirmation: NonNullable<ChatMessage["confirmation"]>;
}) => {
  const [approved, setApproved] = useState<boolean | undefined>();
  const state =
    approved === undefined ? "approval-requested" : "approval-responded";

  return (
    <Confirmation approval={{ approved, id: confirmation.id }} state={state}>
      <ConfirmationTitle>{confirmation.title}</ConfirmationTitle>
      <p className="text-muted-foreground text-sm">
        {confirmation.description}
      </p>
      <ConfirmationRequest>
        <ConfirmationActions>
          <ConfirmationAction
            onClick={() => setApproved(false)}
            variant="outline"
          >
            Deny
          </ConfirmationAction>
          <ConfirmationAction onClick={() => setApproved(true)}>
            Approve
          </ConfirmationAction>
        </ConfirmationActions>
      </ConfirmationRequest>
      <ConfirmationAccepted>
        <p className="text-muted-foreground text-sm">
          Approved — applying the fix now.
        </p>
      </ConfirmationAccepted>
      <ConfirmationRejected>
        <p className="text-muted-foreground text-sm">
          Denied — no changes were made.
        </p>
      </ConfirmationRejected>
    </Confirmation>
  );
};

const ChatCheckpoint = ({ label }: { label: string }) => (
  <Checkpoint>
    <CheckpointIcon />
    <CheckpointTrigger
      onClick={() => toast.add({ description: label, title: "Checkpoint" })}
      tooltip="View checkpoint details"
    >
      {label}
    </CheckpointTrigger>
  </Checkpoint>
);

const ChatArtifactButton = ({
  artifact,
  onOpen,
}: {
  artifact: MessageArtifact;
  onOpen: (artifact: MessageArtifact) => void;
}) => (
  <Button onClick={() => onOpen(artifact)} size="sm" variant="outline">
    View {artifact.filename} in canvas
  </Button>
);

/** One conversation turn: source list, reasoning, and versioned content, wrapped in a branch selector when the turn has multiple versions. */
const ChatMessageBranch = ({
  message: { versions, ...message },
  onOpenArtifact,
}: {
  message: ChatMessage;
  onOpenArtifact: (artifact: MessageArtifact) => void;
}) => (
  <MessageBranch defaultBranch={0}>
    <MessageBranchContent>
      {/* fallow-ignore-next-line complexity */}
      {versions.map((version) => (
        <Message from={message.from} key={`${message.key}-${version.id}`}>
          <div>
            {message.attachments?.length ? (
              <ChatAttachments attachments={message.attachments} />
            ) : null}
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
            {message.chainOfThought && (
              <ChatChainOfThought steps={message.chainOfThought} />
            )}
            {message.tools && <ChatTools tools={message.tools} />}
            {message.task && <ChatTask task={message.task} />}
            <MessageContent>
              <MessageResponse>{version.content}</MessageResponse>
            </MessageContent>
            {message.citation && <ChatCitation citation={message.citation} />}
            {message.plan && <ChatPlan plan={message.plan} />}
            {message.queue && <ChatQueue queue={message.queue} />}
            {message.artifact && (
              <ChatArtifactButton
                artifact={message.artifact}
                onOpen={onOpenArtifact}
              />
            )}
            {message.confirmation && (
              <ChatConfirmation confirmation={message.confirmation} />
            )}
            {message.checkpoint && (
              <ChatCheckpoint label={message.checkpoint} />
            )}
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
  const [openArtifact, setOpenArtifact] = useState<MessageArtifact | null>(
    null
  );
  const { messages, sendMessage, status, stopMessage } =
    useMockChatConversation();

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
            <ChatMessageBranch
              key={message.key}
              message={message}
              onOpenArtifact={setOpenArtifact}
            />
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
                  <IconEarth size={16} />
                  <span>Search</span>
                </PromptInputButton>
                <ChatModelPicker
                  model={model}
                  onOpenChange={setModelSelectorOpen}
                  onSelect={handleModelSelect}
                  open={modelSelectorOpen}
                />
              </PromptInputTools>
              <PromptInputSubmit
                disabled={isSubmitDisabled}
                onStop={stopMessage}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
      <Sheet
        onOpenChange={(open) => {
          if (!open) {
            setOpenArtifact(null);
          }
        }}
        open={openArtifact !== null}
      >
        <SheetContent className="w-full gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="sr-only">
            <SheetTitle>{openArtifact?.title}</SheetTitle>
          </SheetHeader>
          {openArtifact && (
            <Artifact className="size-full rounded-none border-0">
              <ArtifactHeader>
                <div>
                  <ArtifactTitle>{openArtifact.title}</ArtifactTitle>
                  <ArtifactDescription>
                    {openArtifact.description}
                  </ArtifactDescription>
                </div>
                <ArtifactActions>
                  <ArtifactClose onClick={() => setOpenArtifact(null)} />
                </ArtifactActions>
              </ArtifactHeader>
              <ArtifactContent className="p-0">
                <CodeBlock
                  code={openArtifact.content}
                  language={openArtifact.language as BundledLanguage}
                />
              </ArtifactContent>
            </Artifact>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
