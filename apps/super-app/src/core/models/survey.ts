import { Exclude, Expose } from "@/libs/class-transformer";

enum ESurveyStatus {
  PLANNING = "planning",
  IN_PROGRESS = "in_progress",
  RELEASED = "released",
}

export enum ESortGetListSurvey {
  SORT_UNSPECIFIED = "SORT_UNSPECIFIED",
  SORT_DESC = "SORT_DESC",
  SORT_ASC = "SORT_ASC",
}

export enum ESortByGetListSurvey {
  SURVEY_SORT_BY_UNSPECIFIED = "SURVEY_SORT_BY_UNSPECIFIED",
  SURVEY_SORT_BY_CREATED_AT = "SURVEY_SORT_BY_CREATED_AT",
  SURVEY_SORT_BY_VOTE_COUNT = "SURVEY_SORT_BY_VOTE_COUNT",
}

const SURVEY_FORM_KEY = {
  CONTENT: "content",
  TITLE: "title",
} as const;

const SURVEY_LIST_FILTER_KEY = {
  PAGE: "page",
  PAGE_SIZE: "pageSize",
  SORT: "sort",
  SORT_BY: "sortBy",
} as const;

@Exclude()
export class SurveyModel {
  @Expose({ name: "ref_id" })
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  content!: string;

  @Expose({ name: "vote_count" })
  voteCount!: number;

  @Expose()
  status!: ESurveyStatus;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose({ name: "updated_at" })
  updatedAt!: string;

  @Expose({ name: "has_voted" })
  hasVoted!: boolean;
}

export interface TSurveyFormInput {
  [SURVEY_FORM_KEY.TITLE]: string;
  [SURVEY_FORM_KEY.CONTENT]: string;
}

export interface TGetListSurveyParams {
  [SURVEY_LIST_FILTER_KEY.SORT]: ESortGetListSurvey;
  [SURVEY_LIST_FILTER_KEY.SORT_BY]: ESortByGetListSurvey;
  [SURVEY_LIST_FILTER_KEY.PAGE_SIZE]?: number;
  [SURVEY_LIST_FILTER_KEY.PAGE]?: number;
}
