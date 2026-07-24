import { Badge } from "@/components/badge";

function parseContentWithBadges(
  content: string,
  onReferenceClick: (refId: number) => void
): React.ReactNode[] {
  const regex = /\[(?<refNumber>\d+)\]/gu;
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastWasBadge = false;

  while ((match = regex.exec(content)) !== null) {
    const { index } = match;
    const number = Number(match.groups?.refNumber);

    // Push text before match
    if (index > lastIndex) {
      const text = content.slice(lastIndex, index);
      result.push(text);
      lastWasBadge = false;
    }

    // Add spacing if the previous node was also a badge
    if (lastWasBadge) {
      result.push(" ");
    }

    // Push badge
    result.push(
      <Badge
        type="dot"
        size="small"
        key={`badge-${number}-${index}`}
        className="hover:bg-neutral-150 hover:text-text-general-inverse hover:border-neutral-150 inline-block min-w-[18px] cursor-pointer"
        onClick={() => onReferenceClick(number)}
      >
        {number}
      </Badge>
    );

    ({ lastIndex } = regex);
    lastWasBadge = true;
  }

  // Push remaining text
  if (lastIndex < content.length) {
    result.push(content.slice(lastIndex));
  }

  return result;
}

export { parseContentWithBadges };
