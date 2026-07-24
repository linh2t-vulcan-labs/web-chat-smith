"use client";

import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import type { UIMessage } from "ai";
// import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";
import {
  // createContext,
  memo,
  // useCallback,
  // useContext,
  // useEffect,
  // useMemo,
  // useState,
} from "react";
import { Streamdown } from "streamdown";

import type { Button } from "@/features/suite/components/ui/button";
import type { ButtonGroup } from "@/features/suite/components/ui/button-group";
// import { ButtonGroupText } from "@/features/suite/components/ui/button-group";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/features/suite/components/ui/tooltip";
import { cn } from "@/features/suite/utils/classnames";
import { SUITE_TEXT_ANIMATION } from "@/features/suite/utils/constants/text-animation";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full max-w-[95%] flex-col gap-2",
      from === "user" ? "is-user ms-auto justify-end" : "is-assistant",
      className
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "relative flex w-fit max-w-full min-w-0 flex-col gap-2 overflow-hidden text-sm",
      "group-[.is-user]:ms-auto",
      "group-[.is-assistant]:text-foreground group-[.is-user]:rounded-v1-xl group-[.is-user]:bg-v1-surface-conversation-user-base",
      "group-[.is-user]:before:rounded-v1-xl group-[.is-user]:before:bg-v1-surface-conversation-user-material group-[.is-user]:before:pointer-events-none group-[.is-user]:before:absolute group-[.is-user]:before:inset-0 group-[.is-user]:before:content-['']",
      "group-[.is-user]:py-v1-structural-component-small group-[.is-user]:ps-v1-structural-component-medium group-[.is-user]:pe-v1-structural-component-medium",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageActionsProps = ComponentProps<"div">;

// const MessageActions = ({
//   className,
//   children,
//   ...props
// }: MessageActionsProps) => (
//   <div className={cn("flex items-center gap-1", className)} {...props}>
//     {children}
//   </div>
// );

export type MessageActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
};

// const MessageAction = ({
//   tooltip,
//   children,
//   label,
//   variant = "ghost",
//   size = "icon-sm",
//   ...props
// }: MessageActionProps) => {
//   const button = (
//     <Button size={size} type="button" variant={variant} {...props}>
//       {children}
//       <span className="sr-only">{label || tooltip}</span>
//     </Button>
//   );

//   if (tooltip) {
//     return (
//       <TooltipProvider>
//         <Tooltip>
//           <TooltipTrigger>{button}</TooltipTrigger>
//           <TooltipContent>
//             <p>{tooltip}</p>
//           </TooltipContent>
//         </Tooltip>
//       </TooltipProvider>
//     );
//   }

//   return button;
// };

// interface MessageBranchContextType {
//   currentBranch: number;
//   totalBranches: number;
//   goToPrevious: () => void;
//   goToNext: () => void;
//   branches: ReactElement[];
//   setBranches: (branches: ReactElement[]) => void;
// }

// const MessageBranchContext = createContext<MessageBranchContextType | null>(
//   null
// );

// const useMessageBranch = () => {
//   const context = useContext(MessageBranchContext);

//   if (!context) {
//     throw new Error(
//       "MessageBranch components must be used within MessageBranch"
//     );
//   }

//   return context;
// };

export type MessageBranchProps = HTMLAttributes<HTMLDivElement> & {
  defaultBranch?: number;
  onBranchChange?: (branchIndex: number) => void;
};

// const MessageBranch = ({
//   defaultBranch = 0,
//   onBranchChange,
//   className,
//   ...props
// }: MessageBranchProps) => {
//   const [currentBranch, setCurrentBranch] = useState(defaultBranch);
//   const [branches, setBranches] = useState<ReactElement[]>([]);

//   const handleBranchChange = useCallback(
//     (newBranch: number) => {
//       setCurrentBranch(newBranch);
//       onBranchChange?.(newBranch);
//     },
//     [onBranchChange]
//   );

//   const goToPrevious = useCallback(() => {
//     const newBranch =
//       currentBranch > 0 ? currentBranch - 1 : branches.length - 1;
//     handleBranchChange(newBranch);
//   }, [currentBranch, branches.length, handleBranchChange]);

//   const goToNext = useCallback(() => {
//     const newBranch =
//       currentBranch < branches.length - 1 ? currentBranch + 1 : 0;
//     handleBranchChange(newBranch);
//   }, [currentBranch, branches.length, handleBranchChange]);

//   const contextValue = useMemo<MessageBranchContextType>(
//     () => ({
//       branches,
//       currentBranch,
//       goToNext,
//       goToPrevious,
//       setBranches,
//       totalBranches: branches.length,
//     }),
//     [branches, currentBranch, goToNext, goToPrevious]
//   );

//   return (
//     <MessageBranchContext value={contextValue}>
//       <div
//         className={cn("grid w-full gap-2 [&>div]:pb-0", className)}
//         {...props}
//       />
//     </MessageBranchContext>
//   );
// };

export type MessageBranchContentProps = HTMLAttributes<HTMLDivElement>;

// const MessageBranchContent = ({
//   children,
//   ...props
// }: MessageBranchContentProps) => {
//   const { currentBranch, setBranches, branches } = useMessageBranch();
//   const childrenArray = useMemo(
//     () => (Array.isArray(children) ? children : [children]),
//     [children]
//   );

//   // Use useEffect to update branches when they change
//   useEffect(() => {
//     if (branches.length !== childrenArray.length) {
//       setBranches(childrenArray);
//     }
//   }, [childrenArray, branches, setBranches]);

//   return childrenArray.map((branch, index) => (
//     <div
//       className={cn(
//         "grid gap-2 overflow-hidden [&>div]:pb-0",
//         index === currentBranch ? "block" : "hidden"
//       )}
//       key={branch.key}
//       {...props}
//     >
//       {branch}
//     </div>
//   ));
// };

export type MessageBranchSelectorProps = ComponentProps<typeof ButtonGroup>;

// const MessageBranchSelector = ({
//   className,
//   ...props
// }: MessageBranchSelectorProps) => {
//   const { totalBranches } = useMessageBranch();

//   // Don't render if there's only one branch
//   if (totalBranches <= 1) {
//     return null;
//   }

//   return (
//     <ButtonGroup
//       className={cn(
//         "[&>*:not(:first-child)]:rounded-s-md [&>*:not(:last-child)]:rounded-e-md",
//         className
//       )}
//       orientation="horizontal"
//       {...props}
//     />
//   );
// };

export type MessageBranchPreviousProps = ComponentProps<typeof Button>;

// const MessageBranchPrevious = ({
//   children,
//   ...props
// }: MessageBranchPreviousProps) => {
//   const { goToPrevious, totalBranches } = useMessageBranch();

//   return (
//     <Button
//       aria-label="Previous branch"
//       disabled={totalBranches <= 1}
//       onClick={goToPrevious}
//       size="icon-sm"
//       type="button"
//       variant="ghost"
//       {...props}
//     >
//       {children ?? <ChevronLeftIcon size={14} />}
//     </Button>
//   );
// };

export type MessageBranchNextProps = ComponentProps<typeof Button>;

// const MessageBranchNext = ({ children, ...props }: MessageBranchNextProps) => {
//   const { goToNext, totalBranches } = useMessageBranch();

//   return (
//     <Button
//       aria-label="Next branch"
//       disabled={totalBranches <= 1}
//       onClick={goToNext}
//       size="icon-sm"
//       type="button"
//       variant="ghost"
//       {...props}
//     >
//       {children ?? <ChevronRightIcon size={14} />}
//     </Button>
//   );
// };

export type MessageBranchPageProps = HTMLAttributes<HTMLSpanElement>;

// const MessageBranchPage = ({ className, ...props }: MessageBranchPageProps) => {
//   const { currentBranch, totalBranches } = useMessageBranch();

//   return (
//     <ButtonGroupText
//       className={cn(
//         "text-muted-foreground border-none bg-transparent shadow-none",
//         className
//       )}
//       {...props}
//     >
//       {currentBranch + 1} of {totalBranches}
//     </ButtonGroupText>
//   );
// };

export type MessageResponseProps = ComponentProps<typeof Streamdown>;

const streamdownPlugins = { cjk, code, math, mermaid };

// Streamdown's default <ul> uses list-inside + a native ::marker, whose marker→text gap is
// browser-fixed (~7px) and not settable in CSS. Override it: drop the native marker (list-none)
// and draw the bullet as an absolutely-positioned ::before dot so the gap is exact and controllable
// (absolute, not flex, so nested lists don't break). Ordered lists keep Streamdown's default.
function SuiteMarkdownUl({
  className,
  node: _node,
  ...props
}: ComponentProps<"ul"> & { node?: unknown }) {
  return (
    <ul
      data-streamdown="unordered-list"
      className={cn(
        "list-none whitespace-normal in-[li]:pl-6",
        // dot size-1 (4px) at left:0 + text pl-2.5 (10px) → exact 1.5 (6px) gap between dot and text.
        // top-3 (12px) centers the dot on the first line: py-1 top (4px) + (line-height 20px − 4px)/2.
        "[&>li]:relative [&>li]:pl-2.5",
        "[&>li]:before:absolute [&>li]:before:top-3 [&>li]:before:left-0 [&>li]:before:size-1 [&>li]:before:rounded-full [&>li]:before:bg-current [&>li]:before:content-['']",
        className
      )}
      {...props}
    />
  );
}

export const MessageResponse = memo(
  ({ className, animated: _animated, ...props }: MessageResponseProps) => (
    <Streamdown
      className={cn(
        "typo-v1-body-longform size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      plugins={streamdownPlugins}
      isAnimating={props.isAnimating}
      animated={SUITE_TEXT_ANIMATION}
      mode="streaming"
      {...props}
      components={{ ...props.components, ul: SuiteMarkdownUl }}
    />
  ),
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    nextProps.isAnimating === prevProps.isAnimating
);

MessageResponse.displayName = "MessageResponse";

export type MessageToolbarProps = ComponentProps<"div">;

// const MessageToolbar = ({
//   className,
//   children,
//   ...props
// }: MessageToolbarProps) => (
//   <div
//     className={cn(
//       "mt-4 flex w-full items-center justify-between gap-4",
//       className
//     )}
//     {...props}
//   >
//     {children}
//   </div>
// );
