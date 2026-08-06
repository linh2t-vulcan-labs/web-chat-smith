"use client";

import { AlertCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { TProps as JsxParserProps } from "react-jsx-parser";
import JsxParser from "react-jsx-parser";

import { cn } from "#lib/utils";

interface JSXPreviewContextValue {
  jsx: string;
  processedJsx: string;
  isStreaming: boolean;
  error: Error | null;
  setError: (error: Error | null) => void;
  setLastGoodJsx: (jsx: string) => void;
  components: JsxParserProps["components"];
  bindings: JsxParserProps["bindings"];
  onErrorProp?: (error: Error) => void;
}

const JSXPreviewContext = createContext<JSXPreviewContextValue | null>(null);

const TAG_REGEX =
  /<\/?(?<tagName>[a-zA-Z][a-zA-Z0-9]*)\s*(?<attributes>[^>]*?)(?<selfClosing>\/)?>/u;

export const useJSXPreview = () => {
  const context = useContext(JSXPreviewContext);
  if (!context) {
    throw new Error("JSXPreview components must be used within JSXPreview");
  }
  return context;
};

type JsxTagType = "self-closing" | "closing" | "opening";

const getJsxTagType = (
  fullMatch: string,
  selfClosing: string | undefined
): JsxTagType => {
  if (selfClosing) {
    return "self-closing";
  }
  return fullMatch.startsWith("</") ? "closing" : "opening";
};

interface JsxTagPatternMatch {
  fullMatch: string;
  index: number;
  groups: { tagName?: string; attributes?: string; selfClosing?: string };
}

const matchTagPattern = (code: string): JsxTagPatternMatch | null => {
  const match = code.match(TAG_REGEX);

  if (!match || match.index === undefined) {
    return null;
  }

  return {
    fullMatch: match[0],
    groups: match.groups ?? {},
    index: match.index,
  };
};

const matchJsxTag = (code: string) => {
  if (code.trim() === "") {
    return null;
  }

  const matched = matchTagPattern(code);
  if (!matched) {
    return null;
  }

  const { fullMatch, index, groups } = matched;
  const { tagName = "", attributes = "", selfClosing } = groups;

  return {
    attributes: attributes.trim(),
    endIndex: index + fullMatch.length,
    startIndex: index,
    tag: fullMatch,
    tagName,
    type: getJsxTagType(fullMatch, selfClosing),
  };
};

const stripIncompleteTag = (text: string) => {
  // Find the last '<' that isn't part of a complete tag
  const lastOpen = text.lastIndexOf("<");
  if (lastOpen === -1) {
    return text;
  }

  const afterOpen = text.slice(lastOpen);
  // If there's no closing '>' after the last '<', it's an incomplete tag
  if (!afterOpen.includes(">")) {
    return text.slice(0, lastOpen);
  }

  return text;
};

const updateTagStack = (stack: string[], tagName: string, type: JsxTagType) => {
  if (type === "opening") {
    stack.push(tagName);
  } else if (type === "closing") {
    stack.pop();
  }
};

const completeJsxTag = (code: string) => {
  const stack: string[] = [];
  let result = "";
  let currentPosition = 0;

  while (currentPosition < code.length) {
    const match = matchJsxTag(code.slice(currentPosition));
    if (!match) {
      // No more tags found, strip any trailing incomplete tag
      result += stripIncompleteTag(code.slice(currentPosition));
      break;
    }
    const { tagName, type, endIndex } = match;

    // Include any text content before this tag
    result += code.slice(currentPosition, currentPosition + endIndex);
    updateTagStack(stack, tagName, type);

    currentPosition += endIndex;
  }

  return (
    result +
    [...stack]
      .toReversed()
      .map((tag: string) => `</${tag}>`)
      .join("")
  );
};

export type JSXPreviewProps = ComponentProps<"div"> & {
  jsx: string;
  isStreaming?: boolean;
  components?: JsxParserProps["components"];
  bindings?: JsxParserProps["bindings"];
  onError?: (error: Error) => void;
};

export const JSXPreview = ({
  jsx,
  isStreaming = false,
  components,
  bindings,
  onError,
  className,
  children,
  ...props
}: JSXPreviewProps) => {
  const [prevJsx, setPrevJsx] = useState(jsx);
  const [error, setError] = useState<Error | null>(null);
  const [_lastGoodJsx, setLastGoodJsx] = useState("");

  // Clear error when jsx changes (derived state pattern)
  if (jsx !== prevJsx) {
    setPrevJsx(jsx);
    setError(null);
  }

  const processedJsx = isStreaming ? completeJsxTag(jsx) : jsx;

  const contextValue: JSXPreviewContextValue = {
    bindings,
    components,
    error,
    isStreaming,
    jsx,
    onErrorProp: onError,
    processedJsx,
    setError,
    setLastGoodJsx,
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <JSXPreviewContext.Provider value={contextValue}>
      <div className={cn("relative", className)} {...props}>
        {children}
      </div>
    </JSXPreviewContext.Provider>
  );
};

export type JSXPreviewContentProps = Omit<ComponentProps<"div">, "children">;

export const JSXPreviewContent = ({
  className,
  ...props
}: JSXPreviewContentProps) => {
  const {
    processedJsx,
    isStreaming,
    components,
    bindings,
    setError,
    setLastGoodJsx,
    onErrorProp,
  } = useJSXPreview();
  const errorReportedRef = useRef<string | null>(null);
  const [prevProcessedJsx, setPrevProcessedJsx] = useState(processedJsx);
  const [hadError, setHadError] = useState(false);
  const [lastGoodJsx, setLastGoodJsxLocal] = useState("");

  // Reset error tracking when jsx changes (derived state pattern)
  if (processedJsx !== prevProcessedJsx) {
    setPrevProcessedJsx(processedJsx);
    setHadError(false);
  }

  useEffect(() => {
    errorReportedRef.current = null;
  }, [processedJsx]);

  const handleError = (err: Error) => {
    // Prevent duplicate error reports for the same jsx
    if (errorReportedRef.current === processedJsx) {
      return;
    }
    errorReportedRef.current = processedJsx;

    // During streaming, suppress errors and fall back to last good JSX
    if (isStreaming) {
      setHadError(true);
      return;
    }

    setError(err);
    onErrorProp?.(err);
  };

  // Track the last JSX that rendered without error
  useEffect(() => {
    if (!errorReportedRef.current) {
      setLastGoodJsxLocal(processedJsx);
      setLastGoodJsx(processedJsx);
    }
  }, [processedJsx, setLastGoodJsx]);

  // During streaming, if the current JSX errored, re-render with last good version
  const displayJsx = isStreaming && hadError ? lastGoodJsx : processedJsx;

  return (
    <div className={cn("jsx-preview-content", className)} {...props}>
      <JsxParser
        bindings={bindings}
        components={components}
        jsx={displayJsx}
        onError={handleError}
        renderInWrapper={false}
      />
    </div>
  );
};

export type JSXPreviewErrorProps = ComponentProps<"div"> & {
  children?: ReactNode | ((error: Error) => ReactNode);
};

const renderChildren = (
  children: ReactNode | ((error: Error) => ReactNode),
  error: Error
): ReactNode => {
  if (typeof children === "function") {
    return children(error);
  }
  return children;
};

export const JSXPreviewError = ({
  className,
  children,
  ...props
}: JSXPreviewErrorProps) => {
  const { error } = useJSXPreview();

  if (!error) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm",
        className
      )}
      {...props}
    >
      {children ? (
        renderChildren(children, error)
      ) : (
        <>
          <AlertCircle className="size-4 shrink-0" />
          <span>{error.message}</span>
        </>
      )}
    </div>
  );
};
