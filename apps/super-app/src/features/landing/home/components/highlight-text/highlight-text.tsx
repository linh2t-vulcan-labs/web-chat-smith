import React from "react";

interface HighlightTextProps {
  text: string;
  highlights: string[];
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, highlights }) => {
  const regex = new RegExp(
    `(${highlights.map((h) => h.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&")).join("|")})`,
    "giu"
  );

  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, index) => {
        const match = highlights.find(
          (h) => part.toLowerCase() === h.toLowerCase()
        );
        if (match) {
          return (
            <strong key={index} className="font-bold">
              {part}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default HighlightText;
