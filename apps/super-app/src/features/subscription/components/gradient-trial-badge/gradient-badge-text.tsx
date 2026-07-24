import React from "react";

const GradientTrialBadge = ({ content }: { content: string }) => (
  <span className="bg-surface-general-highlight px-small-1 py-small-0.5 text-footnoteS-highlight inline-block rounded-full">
    <strong className="bg-gradient-green bg-clip-text whitespace-nowrap text-transparent">
      {content}
    </strong>
  </span>
);

export default GradientTrialBadge;
