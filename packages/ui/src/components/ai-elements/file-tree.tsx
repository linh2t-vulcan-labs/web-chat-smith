"use client";

import { IconChevronRight } from "@cs/icons/chevron-right";
import { IconFile } from "@cs/icons/file";
import { IconFolder } from "@cs/icons/folder";
import { FolderOpenIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#components/shadcn/collapsible";
import { cn } from "#lib/utils";

interface FileTreeContextType {
  expandedPaths: Set<string>;
  togglePath: (path: string) => void;
  selectedPath?: string;
  onSelect?: (path: string) => void;
}

// Default noop for context default value
// oxlint-disable-next-line no-empty-function -- intentional no-op default
const noop = () => {};

const EMPTY_EXPANDED_PATHS = new Set<string>();

const FileTreeContext = createContext<FileTreeContextType>({
  expandedPaths: EMPTY_EXPANDED_PATHS,
  togglePath: noop,
});

export type FileTreeProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  expanded?: Set<string>;
  defaultExpanded?: Set<string>;
  selectedPath?: string;
  onSelect?: (path: string) => void;
  onExpandedChange?: (expanded: Set<string>) => void;
};

export const FileTree = ({
  expanded: controlledExpanded,
  defaultExpanded = EMPTY_EXPANDED_PATHS,
  selectedPath,
  onSelect,
  onExpandedChange,
  className,
  children,
  ...props
}: FileTreeProps) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expandedPaths = controlledExpanded ?? internalExpanded;

  const togglePath = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setInternalExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
  };

  const contextValue: FileTreeContextType = {
    expandedPaths,
    onSelect,
    selectedPath,
    togglePath,
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <FileTreeContext value={contextValue}>
      <div
        className={cn(
          "bg-background rounded-lg border font-mono text-sm",
          className
        )}
        role="tree"
        {...props}
      >
        <div className="p-2">{children}</div>
      </div>
    </FileTreeContext>
  );
};

export type FileTreeIconProps = HTMLAttributes<HTMLSpanElement>;

export const FileTreeIcon = ({
  className,
  children,
  ...props
}: FileTreeIconProps) => (
  <span className={cn("shrink-0", className)} {...props}>
    {children}
  </span>
);

export type FileTreeNameProps = HTMLAttributes<HTMLSpanElement>;

export const FileTreeName = ({
  className,
  children,
  ...props
}: FileTreeNameProps) => (
  <span className={cn("truncate", className)} {...props}>
    {children}
  </span>
);

interface FileTreeFolderContextType {
  path: string;
  name: string;
  isExpanded: boolean;
}

const FileTreeFolderContext = createContext<FileTreeFolderContextType>({
  isExpanded: false,
  name: "",
  path: "",
});

export type FileTreeFolderProps = HTMLAttributes<HTMLDivElement> & {
  path: string;
  name: string;
};

interface FileTreeFolderRowProps {
  name: string;
  isExpanded: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

const FolderRowIcon = ({ isExpanded }: { isExpanded: boolean }) =>
  isExpanded ? (
    <FolderOpenIcon className="size-4 text-blue-500" />
  ) : (
    <IconFolder className="size-4 text-blue-500" />
  );

const FileTreeFolderRow = ({
  name,
  isExpanded,
  isSelected,
  onSelect,
}: FileTreeFolderRowProps) => (
  <div
    className={cn(
      "hover:bg-muted/50 flex w-full items-center gap-1 rounded px-2 py-1 text-left transition-colors",
      isSelected && "bg-muted"
    )}
  >
    <CollapsibleTrigger
      render={
        <button
          aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          className="flex shrink-0 cursor-pointer items-center border-none bg-transparent p-0"
          type="button"
        />
      }
    >
      <IconChevronRight
        className={cn(
          "text-muted-foreground size-4 shrink-0 transition-transform",
          isExpanded && "rotate-90"
        )}
      />
    </CollapsibleTrigger>
    <button
      className="flex min-w-0 flex-1 cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-left"
      onClick={onSelect}
      type="button"
    >
      <FileTreeIcon>
        <FolderRowIcon isExpanded={isExpanded} />
      </FileTreeIcon>
      <FileTreeName>{name}</FileTreeName>
    </button>
  </div>
);

export const FileTreeFolder = ({
  path,
  name,
  className,
  children,
  ...props
}: FileTreeFolderProps) => {
  const { expandedPaths, togglePath, selectedPath, onSelect } =
    useContext(FileTreeContext);
  const isExpanded = expandedPaths.has(path);
  const isSelected = selectedPath === path;

  const handleOpenChange = () => {
    togglePath(path);
  };

  const handleSelect = () => {
    onSelect?.(path);
  };

  const folderContextValue: FileTreeFolderContextType = {
    isExpanded,
    name,
    path,
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <FileTreeFolderContext value={folderContextValue}>
      <Collapsible onOpenChange={handleOpenChange} open={isExpanded}>
        <div
          className={cn("", className)}
          role="treeitem"
          tabIndex={0}
          {...props}
        >
          <FileTreeFolderRow
            isExpanded={isExpanded}
            isSelected={isSelected}
            name={name}
            onSelect={handleSelect}
          />
          <CollapsibleContent>
            <div className="ml-4 border-l pl-2">{children}</div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </FileTreeFolderContext>
  );
};

interface FileTreeFileContextType {
  path: string;
  name: string;
}

const FileTreeFileContext = createContext<FileTreeFileContextType>({
  name: "",
  path: "",
});

export type FileTreeFileProps = HTMLAttributes<HTMLDivElement> & {
  path: string;
  name: string;
  icon?: ReactNode;
};

export const FileTreeFile = ({
  path,
  name,
  icon,
  className,
  children,
  ...props
}: FileTreeFileProps) => {
  const { selectedPath, onSelect } = useContext(FileTreeContext);
  const isSelected = selectedPath === path;

  const handleClick = () => {
    onSelect?.(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      onSelect?.(path);
    }
  };

  const fileContextValue: FileTreeFileContextType = { name, path };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <FileTreeFileContext value={fileContextValue}>
      <div
        className={cn(
          "hover:bg-muted/50 flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors",
          isSelected && "bg-muted",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="treeitem"
        tabIndex={0}
        {...props}
      >
        {children ?? (
          <>
            {/* Spacer for alignment */}
            <span className="size-4 shrink-0" />
            <FileTreeIcon>
              {icon ?? <IconFile className="text-muted-foreground size-4" />}
            </FileTreeIcon>
            <FileTreeName>{name}</FileTreeName>
          </>
        )}
      </div>
    </FileTreeFileContext>
  );
};

export type FileTreeActionsProps = HTMLAttributes<HTMLFieldSetElement>;

const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

export const FileTreeActions = ({
  className,
  children,
  ...props
}: FileTreeActionsProps) => (
  // Stops the parent tree row's onClick/onKeyDown from firing when an action
  // button inside is used; the fieldset itself has no interactive semantics.
  // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- event containment only, not a control
  <fieldset
    className={cn("ml-auto flex items-center gap-1", className)}
    onClick={stopPropagation}
    onKeyDown={stopPropagation}
    {...props}
  >
    {children}
  </fieldset>
);
