import { Exclude, Expose, Transform } from "@/libs/class-transformer";

export type TAssistantType = "writing" | "grammar" | "lyric";

export interface TQueryAssistantInput {
  pageSize: number;
  pageToken?: string;
}

export enum EAssistantId {
  WRITING = "academic_writing",
}

const mappingAssistantIdToAssistantIcon = (
  input: EAssistantId
): TAssistantType => {
  const obj: Record<EAssistantId, TAssistantType> = {
    [EAssistantId.WRITING]: "writing",
  };

  return obj[input] || "writing";
};

const mappingAssistantIdToLabel = (input: EAssistantId): string => {
  const obj: Record<EAssistantId, string> = {
    [EAssistantId.WRITING]: "Assistant Writing",
  };

  return obj[input] || "";
};

@Exclude()
export class AssistantModel {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  @Transform(({ obj }) => mappingAssistantIdToAssistantIcon(obj.id))
  assistantIcon!: TAssistantType;

  @Expose()
  @Transform(({ obj }) => mappingAssistantIdToLabel(obj.id))
  label!: string;
}
