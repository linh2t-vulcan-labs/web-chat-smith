"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, HTMLAttributes } from "react";
import { createContext, memo, useContext, useEffect, useState } from "react";
import type {
  BundledLanguage,
  BundledTheme,
  HighlighterGeneric,
  ThemedToken,
} from "shiki";

import { Button } from "#components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/shadcn/select";
import { useCopyToClipboard } from "#hooks/use-copy-to-clipboard";
import { cn } from "#lib/utils";

// Shiki uses bitflags for font styles: 1=italic, 2=bold, 4=underline
// oxlint-disable-next-line eslint/no-bitwise
const isItalic = (fontStyle: number | undefined) => fontStyle && fontStyle & 1;
// oxlint-disable-next-line eslint/no-bitwise
const isBold = (fontStyle: number | undefined) => fontStyle && fontStyle & 2;
const isUnderline = (fontStyle: number | undefined) =>
  // oxlint-disable-next-line eslint/no-bitwise
  fontStyle && fontStyle & 4;

// Transform tokens to include pre-computed keys to avoid noArrayIndexKey lint
interface KeyedToken {
  token: ThemedToken;
  key: string;
}
interface KeyedLine {
  tokens: KeyedToken[];
  key: string;
}

const addKeysToTokens = (lines: ThemedToken[][]): KeyedLine[] =>
  lines.map((line, lineIdx) => ({
    key: `line-${lineIdx}`,
    tokens: line.map((token, tokenIdx) => ({
      key: `line-${lineIdx}-${tokenIdx}`,
      token,
    })),
  }));

// Token rendering component
const TokenSpan = ({ token }: { token: ThemedToken }) => (
  <span
    className="dark:!bg-[var(--shiki-dark-bg)] dark:!text-[var(--shiki-dark)]"
    style={
      {
        backgroundColor: token.bgColor,
        color: token.color,
        fontStyle: isItalic(token.fontStyle) ? "italic" : undefined,
        fontWeight: isBold(token.fontStyle) ? "bold" : undefined,
        textDecoration: isUnderline(token.fontStyle) ? "underline" : undefined,
        ...token.htmlStyle,
      } as CSSProperties
    }
  >
    {token.content}
  </span>
);

// Line number styles using CSS counters
const LINE_NUMBER_CLASSES = cn(
  "block",
  "before:content-[counter(line)]",
  "before:inline-block",
  "before:[counter-increment:line]",
  "before:w-8",
  "before:mr-4",
  "before:text-right",
  "before:text-muted-foreground/50",
  "before:font-mono",
  "before:select-none"
);

// Line rendering component
const LineSpan = ({
  keyedLine,
  showLineNumbers,
}: {
  keyedLine: KeyedLine;
  showLineNumbers: boolean;
}) => (
  <span className={showLineNumbers ? LINE_NUMBER_CLASSES : "block"}>
    {keyedLine.tokens.length === 0
      ? "\n"
      : keyedLine.tokens.map(({ token, key }) => (
          <TokenSpan key={key} token={token} />
        ))}
  </span>
);

// Types
type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  language: BundledLanguage;
  showLineNumbers?: boolean;
};

interface TokenizedCode {
  tokens: ThemedToken[][];
  fg: string;
  bg: string;
}

interface CodeBlockContextType {
  code: string;
}

// Context
const CodeBlockContext = createContext<CodeBlockContextType>({
  code: "",
});

// Single shared highlighter for the whole app (not one per language): the
// two themes only ever get parsed once, and each language is loaded into
// this same instance on demand instead of spinning up a whole new
// highlighter (with its own copy of both themes) per language.
let sharedHighlighterPromise: Promise<
  HighlighterGeneric<BundledLanguage, BundledTheme>
> | null = null;
const loadedLanguages = new Set<string>();

// Token cache
const tokensCache = new Map<string, TokenizedCode>();

// Subscribers for async token updates
const subscribers = new Map<string, Set<(result: TokenizedCode) => void>>();

const getTokensCacheKey = (code: string, language: BundledLanguage) => {
  const start = code.slice(0, 100);
  const end = code.length > 100 ? code.slice(-100) : "";
  return `${language}:${code.length}:${start}:${end}`;
};

const createSharedHighlighter = async () => {
  // Dynamic imports (rather than static top-level ones) keep shiki's own
  // dynamic-import-based wasm/language loading out of the SSR module graph
  // — Turbopack can't trace it there and throws "Cannot find package
  // shiki-<hash>" if shiki is statically imported into a server-rendered
  // module, even when the code path that calls it is client-only.
  //
  // The JS regex engine (rather than the default oniguruma/wasm one) skips
  // fetching and instantiating a wasm binary entirely — smaller, faster to
  // start, and one less moving part for the bundler to trace.
  const [
    { createHighlighterCore },
    { createJavaScriptRegexEngine },
    { bundledThemes },
  ] = await Promise.all([
    import("shiki/core"),
    import("shiki/engine/javascript"),
    import("shiki/themes"),
  ]);

  return createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [],
    themes: [bundledThemes["github-light"](), bundledThemes["github-dark"]()],
  }) as Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>;
};

const getHighlighter = async (
  language: BundledLanguage
): Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> => {
  sharedHighlighterPromise ??= createSharedHighlighter();
  const highlighter = await sharedHighlighterPromise;

  if (!loadedLanguages.has(language)) {
    try {
      const { bundledLanguages } = await import("shiki/langs");
      const loadLanguage = bundledLanguages[language];
      if (loadLanguage) {
        await highlighter.loadLanguage(loadLanguage());
      }
    } finally {
      // Mark as attempted either way — an unsupported language falls back
      // to "text" in resolveLoadedLanguage below rather than retrying
      // forever.
      loadedLanguages.add(language);
    }
  }

  return highlighter;
};

// Create raw tokens for immediate display while highlighting loads
const createRawTokens = (code: string): TokenizedCode => ({
  bg: "transparent",
  fg: "inherit",
  tokens: code.split("\n").map((line) =>
    line === ""
      ? []
      : [
          {
            color: "inherit",
            content: line,
          } as ThemedToken,
        ]
  ),
});

const notifyTokenSubscribers = (
  tokensCacheKey: string,
  tokenized: TokenizedCode
) => {
  const subs = subscribers.get(tokensCacheKey);
  if (!subs) {
    return;
  }

  for (const sub of subs) {
    sub(tokenized);
  }
  subscribers.delete(tokensCacheKey);
};

const resolveLoadedLanguage = (
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>,
  language: BundledLanguage
): BundledLanguage | "text" => {
  const availableLangs = highlighter.getLoadedLanguages();
  return availableLangs.includes(language) ? language : "text";
};

const toTokenizedCode = (result: {
  bg?: string;
  fg?: string;
  tokens: ThemedToken[][];
}): TokenizedCode => ({
  bg: result.bg ?? "transparent",
  fg: result.fg ?? "inherit",
  tokens: result.tokens,
});

// Fire-and-forget background highlighting: caches the result and notifies
// any subscribers waiting on this cache key.
const runHighlighting = async (
  code: string,
  language: BundledLanguage,
  tokensCacheKey: string
) => {
  try {
    const highlighter = await getHighlighter(language);
    const langToUse = resolveLoadedLanguage(highlighter, language);

    const result = highlighter.codeToTokens(code, {
      lang: langToUse,
      themes: {
        dark: "github-dark",
        light: "github-light",
      },
    });

    const tokenized = toTokenizedCode(result);

    tokensCache.set(tokensCacheKey, tokenized);
    notifyTokenSubscribers(tokensCacheKey, tokenized);
  } catch (error) {
    console.error("Failed to highlight code:", error);
    subscribers.delete(tokensCacheKey);
  }
};

// Synchronous highlight with callback for async results
export const highlightCode = (
  code: string,
  language: BundledLanguage,
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- pub/sub subscriber, not a one-shot promise result: callers need the synchronous cache-hit return path plus the option to be notified later when async highlighting finishes
  callback?: (result: TokenizedCode) => void
): TokenizedCode | null => {
  const tokensCacheKey = getTokensCacheKey(code, language);

  // Return cached result if available
  const cached = tokensCache.get(tokensCacheKey);
  if (cached) {
    return cached;
  }

  // Subscribe callback if provided
  if (callback) {
    if (!subscribers.has(tokensCacheKey)) {
      subscribers.set(tokensCacheKey, new Set());
    }
    subscribers.get(tokensCacheKey)?.add(callback);
  }

  // Shiki's highlighter loads languages/themes via dynamic import, which
  // Turbopack can't resolve during SSR/prerendering. Skip kicking it off on
  // the server — the raw-token fallback renders instead, and the client
  // picks up real highlighting via the effect in useAsyncHighlightedTokens
  // once mounted in the browser.
  if (typeof window === "undefined") {
    return null;
  }

  // Start highlighting in background - fire-and-forget async pattern
  runHighlighting(code, language, tokensCacheKey);

  return null;
};

const CodeBlockBody = memo(
  ({
    tokenized,
    showLineNumbers,
    className,
  }: {
    tokenized: TokenizedCode;
    showLineNumbers: boolean;
    className?: string;
  }) => {
    const preStyle: CSSProperties = {
      backgroundColor: tokenized.bg,
      color: tokenized.fg,
    };

    const keyedLines = addKeysToTokens(tokenized.tokens);

    return (
      <pre
        className={cn(
          "dark:!bg-[var(--shiki-dark-bg)] dark:!text-[var(--shiki-dark)] m-0 p-4 text-sm",
          className
        )}
        style={preStyle}
      >
        <code
          className={cn(
            "font-mono text-sm",
            showLineNumbers && "[counter-increment:line_0] [counter-reset:line]"
          )}
        >
          {keyedLines.map((keyedLine) => (
            <LineSpan
              key={keyedLine.key}
              keyedLine={keyedLine}
              showLineNumbers={showLineNumbers}
            />
          ))}
        </code>
      </pre>
    );
  },
  (prevProps, nextProps) =>
    prevProps.tokenized === nextProps.tokenized &&
    prevProps.showLineNumbers === nextProps.showLineNumbers &&
    prevProps.className === nextProps.className
);

CodeBlockBody.displayName = "CodeBlockBody";

export const CodeBlockContainer = ({
  className,
  language,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { language: string }) => (
  <div
    className={cn(
      "group relative w-full overflow-hidden rounded-md border bg-background text-foreground",
      className
    )}
    data-language={language}
    style={{
      containIntrinsicSize: "auto 200px",
      contentVisibility: "auto",
      ...style,
    }}
    {...props}
  />
);

export const CodeBlockHeader = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-between border-b bg-muted/80 px-3 py-2 text-muted-foreground text-xs",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CodeBlockTitle = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
);

export const CodeBlockFilename = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("font-mono", className)} {...props}>
    {children}
  </span>
);

export const CodeBlockActions = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("-my-1 -mr-1 flex items-center gap-2", className)}
    {...props}
  >
    {children}
  </div>
);

// Tracks the async (fully shiki-highlighted) tokens for the current
// code/language pair, falling back to `fallback` until they arrive.
// Invalidates stale results synchronously during render when code or
// language changes (derived state pattern), instead of via an effect.
const useAsyncHighlightedTokens = (
  code: string,
  language: BundledLanguage,
  fallback: TokenizedCode
) => {
  const [asyncTokens, setAsyncTokens] = useState<TokenizedCode | null>(null);
  const [prevAsyncKey, setPrevAsyncKey] = useState({ code, language });

  if (prevAsyncKey.code !== code || prevAsyncKey.language !== language) {
    setPrevAsyncKey({ code, language });
    setAsyncTokens(null);
  }

  useEffect(() => {
    let cancelled = false;

    highlightCode(code, language, (result) => {
      if (!cancelled) {
        setAsyncTokens(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  return asyncTokens ?? fallback;
};

export const CodeBlockContent = ({
  code,
  language,
  showLineNumbers = false,
}: {
  code: string;
  language: BundledLanguage;
  showLineNumbers?: boolean;
}) => {
  // Synchronous cache lookup — avoids setState in effect for cached results
  const syncTokens = highlightCode(code, language) ?? createRawTokens(code);
  const tokenized = useAsyncHighlightedTokens(code, language, syncTokens);

  return (
    <div className="relative overflow-auto">
      <CodeBlockBody showLineNumbers={showLineNumbers} tokenized={tokenized} />
    </div>
  );
};

export const CodeBlock = ({
  code,
  language,
  showLineNumbers = false,
  className,
  children,
  ...props
}: CodeBlockProps) => {
  const contextValue = { code };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <CodeBlockContext.Provider value={contextValue}>
      <CodeBlockContainer className={className} language={language} {...props}>
        {children}
        <CodeBlockContent
          code={code}
          language={language}
          showLineNumbers={showLineNumbers}
        />
      </CodeBlockContainer>
    </CodeBlockContext.Provider>
  );
};

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CodeBlockCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const { code } = useContext(CodeBlockContext);
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    onCopy,
    onError,
    timeout,
  });

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn("shrink-0", className)}
      onClick={() => copyToClipboard(code)}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};

export type CodeBlockLanguageSelectorProps = ComponentProps<typeof Select>;

export const CodeBlockLanguageSelector = (
  props: CodeBlockLanguageSelectorProps
) => <Select {...props} />;

export type CodeBlockLanguageSelectorTriggerProps = ComponentProps<
  typeof SelectTrigger
>;

export const CodeBlockLanguageSelectorTrigger = ({
  className,
  ...props
}: CodeBlockLanguageSelectorTriggerProps) => (
  <SelectTrigger
    className={cn(
      "h-7 border-none bg-transparent px-2 text-xs shadow-none",
      className
    )}
    size="sm"
    {...props}
  />
);

export type CodeBlockLanguageSelectorValueProps = ComponentProps<
  typeof SelectValue
>;

export const CodeBlockLanguageSelectorValue = (
  props: CodeBlockLanguageSelectorValueProps
) => <SelectValue {...props} />;

export type CodeBlockLanguageSelectorContentProps = ComponentProps<
  typeof SelectContent
>;

export const CodeBlockLanguageSelectorContent = ({
  align = "end",
  ...props
}: CodeBlockLanguageSelectorContentProps) => (
  <SelectContent align={align} {...props} />
);

export type CodeBlockLanguageSelectorItemProps = ComponentProps<
  typeof SelectItem
>;

export const CodeBlockLanguageSelectorItem = (
  props: CodeBlockLanguageSelectorItemProps
) => <SelectItem {...props} />;
