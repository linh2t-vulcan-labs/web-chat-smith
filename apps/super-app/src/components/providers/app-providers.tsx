import {
  Confirm,
  ConfirmationProvider,
} from "@/features/confirmation-dialog/provider/confirmation-provider";
import { FirebaseRemoteConfigProvider } from "@/libs/firebase/provider";
import { NuqsAdapter } from "@/libs/nuqs";
import ReactQueryProvider from "@/libs/react-query/provider";
import { AuthProvider } from "@/store/auth";

import { AuthSyncProvider } from "./auth-sync-provider";
import { ChunkErrorRecovery } from "./chunk-error-recovery";

function AppProviders({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <NuqsAdapter>
      <ReactQueryProvider>
        <FirebaseRemoteConfigProvider>
          <ConfirmationProvider>
            <AuthProvider>
              <AuthSyncProvider>
                <ChunkErrorRecovery />
                {children}
                <Confirm />
              </AuthSyncProvider>
            </AuthProvider>
          </ConfirmationProvider>
        </FirebaseRemoteConfigProvider>
      </ReactQueryProvider>
    </NuqsAdapter>
  );
}

export default AppProviders;
