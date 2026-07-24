import { memo } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import { CopyButton } from "../copy-button";

interface TMessageCodeBlockProps {
  language: string;
  value: string;
}

const MessageCodeBlock = memo(({ language, value }: TMessageCodeBlockProps) => (
  <div className="bg-surface-general-secondary rounded-default relative w-full overflow-hidden">
    <div className="border-border-general-tertiary px-medium-1.5 py-small-1 flex w-full items-center justify-between border-b text-white">
      <span className="text-xs lowercase">{language}</span>
      <div className="flex items-center space-x-1">
        <CopyButton content={value} isShowToast={false} />
      </div>
    </div>
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      customStyle={{
        background: "transparent",
        margin: 0,
        padding: 20,
        width: "100%",
      }}
    >
      {value}
    </SyntaxHighlighter>
  </div>
));

MessageCodeBlock.displayName = "MessageCodeBlock";

export default MessageCodeBlock;
