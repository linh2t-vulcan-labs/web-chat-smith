"use client";

import dynamic from "next/dynamic";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";

import { useMultiTabAuthSync } from "@/hooks/auth/use-multi-tab-auth-sync";
import { useRouter } from "@/i18n/navigation";
import { registerTokenExpiryNavigate } from "@/utils/token-manager/navigation-bridge";

const MultiTabSignoutModal = dynamic(
  () =>
    import("@/features/login/components/multi-tab-signout-modal/multi-tab-signout-modal"),
  {
    ssr: false,
  }
);

export function AuthSyncProvider({ children }: Readonly<PropsWithChildren>) {
  const { openSignoutModal, closeSignoutModal, forceRefresh } =
    useMultiTabAuthSync();
  const router = useRouter();

  useEffect(() => {
    registerTokenExpiryNavigate((href) => router.replace(href));
    return () => registerTokenExpiryNavigate(null);
  }, [router]);

  const handleOnClose = () => {
    closeSignoutModal();
    forceRefresh();
  };
  return (
    <>
      {children}
      {openSignoutModal && (
        <MultiTabSignoutModal open={openSignoutModal} onClose={handleOnClose} />
      )}
    </>
  );
}
