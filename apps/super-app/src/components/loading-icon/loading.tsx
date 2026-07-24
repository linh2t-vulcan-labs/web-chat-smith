import { loadingStyles } from "./consts";
import type { TLoadingIcon } from "./types";

export default function LoadingIcon({ size = "base" }: TLoadingIcon) {
  const { containerStyles, iconStyles } = loadingStyles(size);

  return (
    <div className={containerStyles}>
      <span className={iconStyles} />
    </div>
  );
}
