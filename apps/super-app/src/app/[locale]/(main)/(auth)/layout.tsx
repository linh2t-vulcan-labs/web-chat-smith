import React from "react";

import { MainLayout } from "@/components/main-layout";
import { AppAuthProviders } from "@/components/providers";
import { NotificationProvider } from "@/features/notification/provider/notification-provider";

type LayoutProps = Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>;

export default function Layout({ children, modal }: LayoutProps) {
  return (
    <AppAuthProviders>
      <NotificationProvider>
        <MainLayout>
          {children}
          {modal}
        </MainLayout>
      </NotificationProvider>
    </AppAuthProviders>
  );
}
