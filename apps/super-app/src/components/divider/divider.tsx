import { compositeStyles } from "@/utils/commons/styles";

import type { TDivider } from "./types";

export default function Divider({
  direction = "vertical",
  className,
}: TDivider) {
  if (direction === "vertical") {
    return <VerticalDivider className={className} />;
  }

  return <HorizontalDivider className={className} />;
}

const VerticalDivider: React.FC<Pick<TDivider, "className">> = (props) => {
  const { className = "" } = props;

  return (
    <div
      className={compositeStyles("h-full w-[2px] bg-[#262626]", className)}
    />
  );
};

export const HorizontalDivider: React.FC<Pick<TDivider, "className">> = (
  props
) => {
  const { className = "" } = props;

  return (
    <hr
      className={compositeStyles(
        "border-border-general-secondary thickness-t-thin",
        className
      )}
    />
  );
};
