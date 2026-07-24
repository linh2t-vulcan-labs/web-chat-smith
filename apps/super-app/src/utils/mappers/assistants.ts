import { extractAssistantSetting } from "@/components/assistant-writing/consts";
import type {
  // TAnswerDTO,
  // TMessageDTO,
  TMessageDTO2,
} from "@/core/http/dto/conversation";
// import type { TAssistantType } from "@/core/models/assistant";
// import { EAssistantId } from "@/core/models/assistant";
import type {
  TAssistantSetting,
  TAssistantWriting,
} from "@/core/models/assistant-writing";
// import type { TMessage, TRole } from "@/core/models/conversation";

// import { generateRandomUUIDV4 } from "../commons/helpers";
import { defaultAssistantWriting } from "../constants/assistant";
import { mapDtoToMessageTemp } from "./conversations";

// const transformMessagePromptToDto = (entity: TMessage): TMessageDTO => ({
//   content: entity.message,
//   role: entity.role,
// });

// const transformDtoToPrompt = (dto: TAnswerDTO): TMessage => {
//   const [{ Message }] = dto.choices;
//   return {
//     uid: generateRandomUUIDV4(),
//     status: "success",
//     role: Message.role as TRole,
//     message: Message.content,
//   };
// };

// const mappingAssistantIdToAssistantIcon = (
//   input: EAssistantId
// ): TAssistantType => {
//   const obj: Record<EAssistantId, TAssistantType> = {
//     [EAssistantId.WRITING]: "writing",
//   };

//   return obj[input] || "writing";
// };

// const mappingAssistantIdToLabel = (input: EAssistantId): string => {
//   const obj: Record<EAssistantId, string> = {
//     [EAssistantId.WRITING]: "Assistant Writing",
//   };

//   return obj[input] || "";
// };

const getLatestByRole = (arr: TMessageDTO2[]) => {
  let latestUser: TMessageDTO2 | undefined;
  let latestAssistant: TMessageDTO2 | undefined;

  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const item = arr[i];
    if (item?.messages.role === "user" && !latestUser) {
      latestUser = item;
    } else if (item?.messages.role === "assistant" && !latestAssistant) {
      latestAssistant = item;
    }

    if (latestUser && latestAssistant) {
      break;
    }
  }

  return {
    assistant: latestAssistant,
    user: latestUser,
  };
};

export const transformMessagesDTOToAssistantWriting = (
  entity: TMessageDTO2[]
): TAssistantWriting => {
  if (!entity.length) {
    return defaultAssistantWriting;
  }

  const latest = getLatestByRole(entity);
  if (!(latest.assistant && latest.user)) {
    throw new Error(
      "transformMessagesDTOToAssistantWriting: expected both a user and an assistant message"
    );
  }
  const answer = mapDtoToMessageTemp(latest.assistant);
  const prompt = mapDtoToMessageTemp(latest.user);
  const settings = extractAssistantSetting(prompt.content) as TAssistantSetting;

  return {
    answer,
    settings,
    status: "idle",
  };
};
