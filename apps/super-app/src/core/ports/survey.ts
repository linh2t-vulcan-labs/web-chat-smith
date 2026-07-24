import type {
  CreateSurveyDTO,
  GetListSurveyParams,
} from "@/core/http/dto/survey";
import type { TResult } from "@/core/models/http";
import type {
  SurveyModel,
  TGetListSurveyParams,
  TSurveyFormInput,
} from "@/core/models/survey";

export interface TSurveyServiceApis {
  createSurvey: (input: CreateSurveyDTO) => TResult<SurveyModel>;
  getList: (params: GetListSurveyParams) => TResult<SurveyModel[]>;
  upVote: (surveyId: string) => TResult<Record<string, string>>;
  downVote: (surveyId: string) => TResult<Record<string, string>>;
}

export interface TSurveyRepositories {
  transformToCreateSurveyDto: (input: TSurveyFormInput) => CreateSurveyDTO;
  transformToGetListSurveyParams: (
    input: TGetListSurveyParams
  ) => GetListSurveyParams;
}
