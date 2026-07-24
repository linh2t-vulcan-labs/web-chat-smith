import type {
  TAssistantLength,
  TAssistantSetting,
} from "@/core/models/assistant-writing";

export const PROMPT_LENGTH: Record<TAssistantLength, number> = {
  long: 650,
  medium: 400,
  short: 300,
};

const LENGTH_MAP = {
  300: "short",
  400: "medium",
  650: "long",
};

export const createWritingPrompt = (
  prompt: string,
  setting: TAssistantSetting
) => {
  const { length, tone, technique, feedback } = setting;
  let writingPrompt = `Write a ${length} essay exploring ${prompt}.`;

  if (length) {
    writingPrompt += `\n The length is ${PROMPT_LENGTH[length]} words.`;
  }

  if (tone) {
    writingPrompt += `\n The tone is ${tone}.`;
  }

  if (technique !== "none") {
    writingPrompt += `\n Use the writing technique is ${technique}.`;
  }

  if (feedback) {
    writingPrompt += `\n Feedback: ${feedback}`;
  }

  return writingPrompt;
};

const isKnownLength = (value: number): value is keyof typeof LENGTH_MAP =>
  value in LENGTH_MAP;

export function extractAssistantSetting(input: string) {
  const promptMatch = input.match(/exploring (?<prompt>.+?)\./u);
  const techniqueMatch = input.match(/technique is (?<technique>.+?)\./u);
  const lengthMatch = input.match(/length is (?<length>\d+)/u);
  const toneMatch = input.match(/tone is (?<tone>\w+)/u);
  const feedbackMatch = input.match(/Feedback: (?<feedback>.+)/u);
  const parseLength = lengthMatch?.groups?.length
    ? Math.trunc(Number(lengthMatch.groups.length))
    : 0;

  return {
    feedback: feedbackMatch?.groups?.feedback ?? "",
    length: isKnownLength(parseLength) ? LENGTH_MAP[parseLength] : "short",
    prompt: promptMatch?.groups?.prompt ?? "",
    technique: techniqueMatch?.groups?.technique ?? "",
    tone: toneMatch?.groups?.tone ?? "",
  };
}
