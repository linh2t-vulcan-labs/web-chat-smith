import { CreateSurveyDTO, GetListSurveyParams } from "@/core/http/dto/survey";
import type { TSurveyRepositories } from "@/core/ports/survey";
import { TransformerBuilder } from "@/libs/class-transformer";

const transformToCreateSurveyDto: TSurveyRepositories["transformToCreateSurveyDto"] =
  (input) =>
    new TransformerBuilder(CreateSurveyDTO)
      .format(input)
      .toPlainSnakeCase() as CreateSurveyDTO;

const transformToGetListSurveyParams: TSurveyRepositories["transformToGetListSurveyParams"] =
  (query) =>
    new TransformerBuilder(GetListSurveyParams)
      .format(query, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as GetListSurveyParams;

export const surveyUseCases = (): TSurveyRepositories => ({
  transformToCreateSurveyDto,
  transformToGetListSurveyParams,
});
