import type { TTailwindStyle } from "@/utils/commons/types";

import type { TLoadingSize } from "./types";

import styles from "./styles.module.css";

const loadingIconStyles = new Map<TLoadingSize, string>([
  ["large", [styles.large, styles.loader].join(" ")],
  ["base", [styles.base, styles.loader].join(" ")],
]);

const containerStyles = new Map<TLoadingSize, TTailwindStyle>([
  ["large", "w-[60px]"],
  ["base", "w-[40px]"],
]);

export const loadingStyles = (size: TLoadingSize) => ({
  containerStyles: containerStyles.get(size),
  iconStyles: loadingIconStyles.get(size),
});
