import type { THREAD_GROUP_CONST } from "@/utils/constants/thread";

import type { ConversationModel } from "./conversation";

export type TThreadGroupKeys = keyof typeof THREAD_GROUP_CONST;

export type TThread = ConversationModel;
