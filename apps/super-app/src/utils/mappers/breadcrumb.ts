import { BREADCRUMB_TITLE_MAP } from "../constants/breadcrumb";

export function getBreadcrumbTitle(key: string) {
  return BREADCRUMB_TITLE_MAP.get(key) || "";
}
