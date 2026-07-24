import dynamic from "next/dynamic";

export const buildTimeIcons = {
  aiArt: dynamic(() => import("@/public/icons/outlined/ai-art.svg")),
  appStore: dynamic(() => import("@/public/icons/outlined/apple-store.svg")),
  attachFile: dynamic(() => import("@/public/icons/attach-file.svg")),
  bell: dynamic(() => import("@/public/icons/outlined/bell.svg")),
  chevronRight: dynamic(
    () => import("@/public/icons/outlined/chevron-right.svg")
  ),
  closed: dynamic(() => import("@/public/icons/outlined/closed.svg")),
  deepResearch: dynamic(
    () => import("@/public/icons/outlined/deep-research.svg")
  ),
  delete: dynamic(() => import("@/public/icons/filled/delete.svg")),
  deviceMobile: dynamic(
    () => import("@/public/icons/outlined/device-mobile.svg")
  ),
  dislike: dynamic(() => import("@/public/icons/outlined/dislike.svg")),
  download: dynamic(() => import("@/public/icons/outlined/download.svg")),
  edit: dynamic(() => import("@/public/icons/outlined/edit.svg")),
  editV2: dynamic(() => import("@/public/icons/outlined/edit-v2.svg")),
  error: dynamic(() => import("@/public/icons/filled/error.svg")),
  expand: dynamic(() => import("@/public/icons/outlined/collapse.svg")),
  generating: dynamic(() => import("@/public/icons/filled/stop-generate.svg")),
  googleStore: dynamic(
    () => import("@/public/icons/outlined/google-store.svg")
  ),
  help: dynamic(() => import("@/public/icons/outlined/help.svg")),
  history: dynamic(() => import("@/public/icons/outlined/history.svg")),
  like: dynamic(() => import("@/public/icons/outlined/like.svg")),
  link: dynamic(() => import("@/public/icons/outlined/link.svg")),
  linkAccount: dynamic(
    () => import("@/public/icons/outlined/link-account.svg")
  ),
  lock: dynamic(() => import("@/public/icons/outlined/lock.svg")),
  more: dynamic(() => import("@/public/icons/outlined/setting.svg")),
  newChat: dynamic(() => import("@/public/icons/outlined/newchat.svg")),
  plus: dynamic(() => import("@/public/icons/outlined/plus.svg")),
  pro: dynamic(() => import("@/public/icons/filled/pro.svg")),
  proV2: dynamic(() => import("@/public/icons/filled/crown-v2.svg")),
  send: dynamic(() => import("@/public/icons/filled/send.svg")),
  triangleDown: dynamic(() => import("@/public/icons/triangle-down.svg")),
  webSearch: dynamic(() => import("@/public/icons/outlined/web-search.svg")),
} as const;
