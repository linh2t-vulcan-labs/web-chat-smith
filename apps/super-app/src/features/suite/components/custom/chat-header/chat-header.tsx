"use client";

import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import ArrowLeftToLineIcon from "@/features/suite/assets/icons/arrow-left-to-line-icon.svg";
import ChevronLeftIcon from "@/features/suite/assets/icons/chevron-left-icon.svg";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

// Max characters allowed for a project title rename.
const TITLE_MAX_LENGTH = 200;

interface ChatHeaderProps {
  isRenamingTitle?: boolean;
  canRename?: boolean;
  title?: string;
  onBack?: () => void;
  onCollapse?: () => void;
  onTitleChange?: (title: string) => void;
  onTitleCommit?: () => Promise<void> | void;
  onTitleReset?: () => void;
}

interface ChatHeaderRootProps {
  children: ReactNode;
}

interface ChatHeaderActionButtonProps {
  onClick?: () => void;
}

interface ChatHeaderTitleProps {
  isRenamingTitle?: boolean;
  canRename?: boolean;
  onTitleChange?: (title: string) => void;
  onTitleCommit?: () => Promise<void> | void;
  onTitleReset?: () => void;
  title: string;
}

export function ChatHeader({
  isRenamingTitle,
  canRename = true,
  title = "Untitled Project",
  onBack,
  onCollapse,
  onTitleChange,
  onTitleCommit,
  onTitleReset,
}: ChatHeaderProps) {
  return (
    <ChatHeaderRoot>
      <ChatHeaderContent>
        <ChatHeaderMain>
          <ChatHeaderBackButton onClick={onBack} />
          <ChatHeaderTitle
            title={title}
            isRenamingTitle={isRenamingTitle}
            canRename={canRename}
            onTitleChange={onTitleChange}
            onTitleCommit={onTitleCommit}
            onTitleReset={onTitleReset}
          />
        </ChatHeaderMain>

        <ChatHeaderActions>
          <ChatHeaderCollapseButton onClick={onCollapse} />
        </ChatHeaderActions>
      </ChatHeaderContent>
    </ChatHeaderRoot>
  );
}

function ChatHeaderRoot({ children }: ChatHeaderRootProps) {
  return (
    <div
      data-testid={DATA_TEST_ID.suite.custom.chatHeader}
      className="gap-v1-structural-content-tight py-v1-optical-strong ps-v1-optical-normal pe-v1-optical-normal rounded-v1-xl flex h-15 min-w-0 flex-1 flex-row items-center backdrop-blur-xl"
    >
      {children}
    </div>
  );
}

function ChatHeaderContent({ children }: ChatHeaderRootProps) {
  return (
    <div className="gap-v1-structural-content-normal flex min-w-0 flex-1 flex-row items-center justify-between">
      {children}
    </div>
  );
}

function ChatHeaderMain({ children }: ChatHeaderRootProps) {
  return (
    <div className="gap-v1-structural-content-none flex h-10 min-w-0 flex-1 flex-row items-center">
      {children}
    </div>
  );
}

function ChatHeaderBackButton({ onClick }: ChatHeaderActionButtonProps) {
  return (
    <Button
      aria-label="Go back"
      className="rounded-v1-pill p-v1-optical-normal hover:rounded-v1-circle hover:bg-v1-surface-overlay-interactive-hover size-8 shrink-0 overflow-hidden"
      onClick={onClick}
      type="button"
      variant="ghost"
    >
      <ChevronLeftIcon className="text-v1-text-hierarchy-primary size-5" />
    </Button>
  );
}

function ChatHeaderTitle({
  isRenamingTitle,
  canRename = true,
  onTitleChange,
  onTitleCommit,
  onTitleReset,
  title,
}: ChatHeaderTitleProps) {
  const [isEditing, setIsEditing] = useState(false);

  const closeAndCommit = () => {
    setIsEditing(false);
    void onTitleCommit?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      closeAndCommit();
      return;
    }

    if (e.key === "Escape") {
      setIsEditing(false);
      onTitleReset?.();
    }
  };

  const handleBlur = () => {
    closeAndCommit();
  };

  return (
    <div
      role={canRename ? "button" : undefined}
      tabIndex={canRename && !isEditing ? 0 : -1}
      className={cn(
        "rounded-v1-medium py-v1-structural-component-micro ps-v1-structural-content-micro pe-v1-structural-content-micro flex min-w-0 flex-1 items-center self-stretch overflow-hidden text-left transition-colors",
        canRename && "cursor-pointer",
        isEditing
          ? "bg-v1-surface-overlay-interactive-selected"
          : canRename && "hover:bg-v1-surface-overlay-interactive-hover"
      )}
      onClick={() => {
        if (canRename && !isEditing) {
          setIsEditing(true);
        }
      }}
      onKeyDown={(e) => {
        if (canRename && !isEditing && (e.key === "Enter" || e.key === " ")) {
          setIsEditing(true);
        }
      }}
    >
      {isEditing ? (
        <Input
          autoFocus
          className="rounded-v1-medium! typo-v1-title-lg text-v1-text-hierarchy-primary h-6 border-none bg-transparent! p-0"
          disabled={isRenamingTitle}
          maxLength={TITLE_MAX_LENGTH}
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      ) : (
        <span className="typo-v1-title-lg text-v1-text-hierarchy-primary h-6 min-w-0 flex-1 truncate">
          {title}
        </span>
      )}
    </div>
  );
}

function ChatHeaderActions({ children }: ChatHeaderRootProps) {
  return (
    <div className="gap-v1-optical-subtle pe-v1-structural-content-micro flex shrink-0 flex-row items-center">
      {children}
    </div>
  );
}

function ChatHeaderCollapseButton({ onClick }: ChatHeaderActionButtonProps) {
  return (
    <Button
      aria-label="Collapse sidebar"
      className="rounded-v1-pill p-v1-structural-component-micro hover:rounded-v1-circle hover:bg-v1-surface-overlay-interactive-hover size-9 overflow-hidden"
      onClick={onClick}
      type="button"
      variant="ghost"
    >
      <ArrowLeftToLineIcon className="text-v1-action-icon-secondary size-5" />
    </Button>
  );
}
