import { forwardRef } from "react";

import { buildTimeIcons } from "./const";
import type { TIconProps } from "./types";

const Icon = forwardRef<SVGSVGElement, TIconProps>((props: TIconProps, ref) => {
  const { name, size, className, ...restProps } = props;
  const IconComponent = buildTimeIcons[name] as React.ComponentType<
    React.SVGProps<SVGSVGElement>
  >;

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      {...restProps}
    />
  );
});

Icon.displayName = "Icon";

export default Icon;
