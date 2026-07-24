import { ESyncStatus } from "@/config/chat-sync";

// const SYNC_STATUS_TEXT = {
//   [ESyncStatus.SYNCED]: "Synced",
//   [ESyncStatus.NOT_SYNC]: "Not Sync",
//   [ESyncStatus.PROCESSING]: "Processing",
//   [ESyncStatus.SYNC_FAILED]: "Processing Failed",
// };
export const SYNC_STATUS = [
  {
    brief: "available on all devices",
    icon: "/icons/outlined/cloud.svg",
    status: ESyncStatus.SYNCED,
  },
  {
    brief: "visible on this device only",
    icon: "/icons/outlined/cloud-slash.svg",
    status: ESyncStatus.NOT_SYNC,
  },
  {
    brief: "preparing on this device",
    icon: "/icons/outlined/cloud-syncing.svg",
    status: ESyncStatus.PROCESSING,
  },
  {
    brief: "we couldn’t prepare this conversation",
    icon: "/icons/outlined/cloud-sync-failed.svg",
    status: ESyncStatus.SYNC_FAILED,
  },
];
