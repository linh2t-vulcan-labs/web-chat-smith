"use client";

import { useLocale } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth";
import type { TCreateAuthStore } from "@/store/auth/store";
import { LOCAL_STORAGE_KEY } from "@/utils/commons/keys";

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

interface UseAiToolBannerRedirectInput {
  redirectLink?: string;
}

/** Navigates to CMS `redirectLink` (or default conversation) with login callback when needed. */
export function useAiToolBannerRedirect({
  redirectLink,
}: UseAiToolBannerRedirectInput) {
  const locale = useLocale();
  const authStore = useAuthStore();

  return useCallback(() => {
    if (!authStore) {
      toast.error("Session could not be read. Please refresh the page.");
      return;
    }

    const authed = isAuthenticatedNow(authStore);
    const target = resolveAiToolBannerGenerateHref({
      authed,
      locale,
      redirectLink,
    });
    assignLocationHref(target);
  }, [authStore, locale, redirectLink]);
}
