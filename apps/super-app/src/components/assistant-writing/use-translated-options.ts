import { useTranslations } from "next-intl";

import type { TButtonOption } from "@/components/button-group/types";

/**
 * Hook to translate option labels using next-intl
 * @param options - Array of options with translation keys as labels
 * @param namespace - Translation namespace (e.g., "assistantWriting.settings")
 * @returns Array of options with translated labels
 */
export function useTranslatedOptions(
  options: TButtonOption[],
  namespace: string
): TButtonOption[] {
  const t = useTranslations(namespace);

  return options.map((option) => ({
    ...option,
    label: t(option.label),
  }));
}
