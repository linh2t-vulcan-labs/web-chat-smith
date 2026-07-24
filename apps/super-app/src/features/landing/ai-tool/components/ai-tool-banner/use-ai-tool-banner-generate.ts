"use client";

import { useLocale } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";

import type { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import { useAuthStore } from "@/store/auth";
import type { TCreateAuthStore } from "@/store/auth/store";
import { writeAiToolLandingBannerHandoff } from "@/utils/commons/ai-tool-landing-generate-handoff";
import { LOCAL_STORAGE_KEY } from "@/utils/commons/keys";

import { useFeaturePageTracking } from "../../tracking/use-feature-page-tracking";
import type { AiToolBannerContentStyle } from "../../types/types";
import {
  assignLocationHref,
  resolveAiToolBannerGenerateHref,
} from "../../utils";

function readPersistedAccessTokenPresent(): boolean {
  try {
    const raw = globalThis.localStorage?.getItem(
      LOCAL_STORAGE_KEY.AUTH_STORE_DATA
    );
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string };
    } | null;
    return Boolean(parsed?.state?.accessToken);
  } catch {
    return false;
  }
}

function isAuthenticatedNow(authStore: TCreateAuthStore): boolean {
  const s = authStore.getState();
  return (
    Boolean(s.isAuthenticated || s.accessToken) ||
    readPersistedAccessTokenPresent()
  );
}

interface UseAiToolBannerGenerateInput {
  redirectLink?: string;
  contentStyle?: AiToolBannerContentStyle;
  allowSelectModel?: boolean;
  isAllowArtStyleChosen: boolean;
  selectedArtStyle: EAIART_STYLE;
  prompt: string;
  selectedModelValue?: string;
}

export function useAiToolBannerGenerate({
  redirectLink,
  contentStyle,
  allowSelectModel = true,
  isAllowArtStyleChosen,
  selectedArtStyle,
  prompt,
  selectedModelValue,
}: UseAiToolBannerGenerateInput) {
  const locale = useLocale();
  const authStore = useAuthStore();
  const { trackClickGenerate } = useFeaturePageTracking();

  return useCallback(() => {
    trackClickGenerate("banner");

    if (!authStore) {
      toast.error("Session could not be read. Please refresh the page.");
      return;
    }

    const authed = isAuthenticatedNow(authStore);
    const isModelStyle =
      contentStyle === "translate" ||
      contentStyle === "qa-simple" ||
      contentStyle === "qa-cards";
    const usesModelRedirect = isModelStyle && allowSelectModel;
    const target = resolveAiToolBannerGenerateHref({
      authed,
      locale,
      model: usesModelRedirect ? selectedModelValue : undefined,
      redirectLink,
      replaceSearchParamsWithModel: usesModelRedirect,
    });

    writeAiToolLandingBannerHandoff({
      prompt: prompt.trim(),
      ...(isAllowArtStyleChosen ? { artStyle: selectedArtStyle } : {}),
      ...(usesModelRedirect && selectedModelValue
        ? { model: selectedModelValue }
        : {}),
    });
    assignLocationHref(target);
  }, [
    allowSelectModel,
    authStore,
    contentStyle,
    isAllowArtStyleChosen,
    locale,
    prompt,
    redirectLink,
    selectedArtStyle,
    selectedModelValue,
    trackClickGenerate,
  ]);
}
