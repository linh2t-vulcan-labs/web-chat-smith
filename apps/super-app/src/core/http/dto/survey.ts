import type {
  ESortByGetListSurvey,
  ESortGetListSurvey,
} from "@/core/models/survey";
import { Exclude, Expose } from "@/libs/class-transformer";

@Exclude()
export class GetListSurveyParams {
  @Expose()
  sort!: ESortGetListSurvey;

  @Expose({ name: "sortBy" })
  sort_by!: ESortByGetListSurvey;

  @Expose({ name: "pageSize" })
  page_size?: number;

  @Expose()
  page?: number;
}

@Exclude()
export class CreateSurveyDTO {
  @Expose()
  title!: string;

  @Expose()
  content!: string;
}

export interface TSurveyResponseDTO {
  ref_id: string;
  title: string;
  content: string;
  vote_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  has_voted: boolean;
}
