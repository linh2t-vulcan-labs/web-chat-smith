import type {
  CreateAssistantWriting,
  TAssistantWriting,
  TCreateAssistantWritingIdInput,
  TGetAssistantWritingByIdInput,
  TGetAssistantWritingByIdV2Input,
  TUpdateAssistantWritingByIdInput,
} from "../models/assistant-writing";
import type { TMessageTemp } from "../models/conversation";
import type { TResult } from "../models/http";

export type TAssistantRepositories = object;

export interface TAssistantWritingServiceAPIs {
  createAssistantWritingId: (
    input: TCreateAssistantWritingIdInput
  ) => TResult<CreateAssistantWriting>;
  createAssistantWritingIdV2: (
    input: TCreateAssistantWritingIdInput
  ) => TResult<CreateAssistantWriting>;
  updateAssistantWritingById: (
    input: TUpdateAssistantWritingByIdInput
  ) => TResult<TMessageTemp>;
  getAssistantWritingById: (
    input: TGetAssistantWritingByIdInput
  ) => TResult<TAssistantWriting>;
  getAssistantWritingByIdV2: (
    input: TGetAssistantWritingByIdV2Input
  ) => TResult<TAssistantWriting>;
}
