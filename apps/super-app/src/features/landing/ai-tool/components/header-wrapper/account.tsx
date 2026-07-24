"use client";

import type { Route } from "next";
import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";

import type { UserInfoModel } from "@/core/models/user";
import { userClientService } from "@/core/repositories";
import { useQuery } from "@/libs/react-query";
import { useAuthState } from "@/store/auth";
import { GlobalContext } from "@/store/global/context";
import { getUserInfoQueryKey } from "@/store/global/initialization-hooks/use-init-user-profile";
import type { TCreateGlobalStore } from "@/store/global/store";
import { LOCAL_STORAGE_KEY } from "@/utils/commons/keys";

import styles from "./styles.module.css";

export interface AccountProps {
  loginHref: string;
  signInLabel: string;
  accountAriaLabel: string;
  linkClassName?: string;
}

function AvatarButton({
  displayName,
  accountAriaLabel,
}: {
  displayName: string;
  accountAriaLabel: string;
}) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <button
      type="button"
      className={styles.accountAvatar}
      aria-label={accountAriaLabel}
    >
      {initial}
    </button>
  );
}

function signInLink(
  loginHref: string,
  linkClassName: string | undefined,
  signInLabel: string
) {
  const merged = [styles.headerAuthLink, styles.signInLink, linkClassName]
    .filter(Boolean)
    .join(" ");
  return (
    <Link href={loginHref as Route} className={merged}>
      <span className={styles.signInInner}>{signInLabel}</span>
    </Link>
  );
}

type AccountCoreProps = AccountProps & {
  /** From global store when `GlobalStateProvider` is present; otherwise fetched via `getUserProfile`. */
  user: UserInfoModel | undefined;
};

function AccountCore({
  loginHref,
  signInLabel,
  accountAriaLabel,
  linkClassName,
  user,
}: AccountCoreProps) {
  const isAuthenticated = useAuthState((s) => s.isAuthenticated);
  const accessToken = useAuthState((s) => s.accessToken);

  const [authResolved, setAuthResolved] = useState(false);
  const [hasLocalToken, setHasLocalToken] = useState(false);

  useEffect(() => {
    if (isAuthenticated || Boolean(accessToken)) {
      // oxlint-disable-next-line react/react-compiler -- resolves auth display state once the auth store confirms a session; external auth-store-driven resync, not a render derivation
      setHasLocalToken(false);
      setAuthResolved(true);
      return;
    }

    try {
      const raw = globalThis.localStorage?.getItem(
        LOCAL_STORAGE_KEY.AUTH_STORE_DATA
      );
      if (!raw) {
        setHasLocalToken(false);
        setAuthResolved(true);
        return;
      }
      const parsed = JSON.parse(raw) as {
        state?: { accessToken?: string };
      } | null;
      setHasLocalToken(Boolean(parsed?.state?.accessToken));
    } catch {
      setHasLocalToken(false);
    }
    setAuthResolved(true);
  }, [accessToken, isAuthenticated]);

  const effectiveAuthenticated =
    isAuthenticated || Boolean(accessToken) || hasLocalToken;

  const needsProfileFetch = !user?.id;

  const { data: profileResponse } = useQuery({
    enabled: authResolved && effectiveAuthenticated && needsProfileFetch,
    queryFn: () => userClientService.getUserProfile(),
    queryKey: getUserInfoQueryKey(isAuthenticated),
  });

  const profileUser =
    profileResponse?.[0] === null ? profileResponse[1] : undefined;

  const resolvedUser = useMemo((): UserInfoModel | undefined => {
    if (user?.id) {
      return user;
    }
    return profileUser ?? user;
  }, [user, profileUser]);

  const displayName = useMemo(() => {
    if (!resolvedUser?.id) {
      return "U";
    }
    const fullName =
      `${resolvedUser.firstName || ""} ${resolvedUser.lastName || ""}`.trim();
    return fullName || resolvedUser.username || resolvedUser.email || "U";
  }, [resolvedUser]);

  if (!authResolved) {
    return signInLink(loginHref, linkClassName, signInLabel);
  }

  if (effectiveAuthenticated) {
    return (
      <AvatarButton
        displayName={displayName}
        accountAriaLabel={accountAriaLabel}
      />
    );
  }

  return signInLink(loginHref, linkClassName, signInLabel);
}

function AccountWithGlobalStore({
  store,
  ...props
}: AccountProps & { store: TCreateGlobalStore }) {
  const user = useStore(store, (s) => s.user);
  return <AccountCore {...props} user={user} />;
}

/**
 * Header auth: Sign In until the client has checked auth store + persisted token, then avatar or Sign In.
 * Without `GlobalStateProvider`, loads profile with `getUserProfile` (same React Query key as the main app).
 */
export default function Account(props: AccountProps) {
  const globalStore = useContext(GlobalContext);
  if (!globalStore) {
    return <AccountCore {...props} user={undefined} />;
  }
  return <AccountWithGlobalStore {...props} store={globalStore} />;
}
