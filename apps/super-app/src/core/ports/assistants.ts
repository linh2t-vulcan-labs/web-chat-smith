import type { AssistantModel, TQueryAssistantInput } from "../models/assistant";
import type { TResult } from "../models/http";

export interface TAssistantRepositories {
  getAssistants: (input: TQueryAssistantInput) => TResult<AssistantModel[]>;
}

export interface TAssistantServiceAPIs {
  getAssistants: (input: TQueryAssistantInput) => TResult<AssistantModel[]>;
}
