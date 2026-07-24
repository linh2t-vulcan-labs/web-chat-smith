import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";
import { unwrapEnvelope } from "../../utils/envelope";

// Wire field is `ref_id` (auto-camelCased to `refId`) — confirmed against
// apps/super-app/src/core/models/survey.ts, which renames it to `id` since
// that's what every survey identifier is called everywhere else in this app.
const SurveySchema = z.pipe(
  z.object({
    content: z.string(),
    createdAt: z.string(),
    hasVoted: z.boolean(),
    refId: z.string(),
    status: z.enum(["planning", "in_progress", "released"]),
    title: z.string(),
    updatedAt: z.string(),
    voteCount: z.number(),
  }),
  z.transform(({ refId, ...rest }) => ({ ...rest, id: refId }))
);

const SortSchema = z.enum(["SORT_UNSPECIFIED", "SORT_DESC", "SORT_ASC"]);
const SortBySchema = z.enum([
  "SURVEY_SORT_BY_UNSPECIFIED",
  "SURVEY_SORT_BY_CREATED_AT",
  "SURVEY_SORT_BY_VOTE_COUNT",
]);

/** Survey domain, on the `smith-engine` service (confirmed by reading `temp/repositories/survey-service.ts` directly). */
export const survey = defineService("smith-engine")
  .endpoint("create", {
    auth: "required",
    method: "POST",
    path: "/users/web/surveys",
    responseSchema: unwrapEnvelope("data", SurveySchema),
    retry: false,
    toBody: (input: { title: string; content: string }) => input,
    version: "v1",
  })
  .endpoint("list", {
    auth: "required",
    method: "GET",
    path: "/users/web/surveys",
    responseSchema: unwrapEnvelope("data", z.array(SurveySchema)),
    toQuery: (input: {
      sort: z.infer<typeof SortSchema>;
      sortBy: z.infer<typeof SortBySchema>;
      pageSize?: number;
      page?: number;
    }) => input,
    version: "v1",
  })
  .endpoint("upvote", {
    auth: "required",
    method: "POST",
    path: (input: { surveyId: string }) =>
      `/users/web/surveys/${input.surveyId}/vote`,
    responseSchema: z.record(z.string(), z.string()),
    retry: false,
    version: "v1",
  })
  .endpoint("downvote", {
    auth: "required",
    method: "POST",
    path: (input: { surveyId: string }) =>
      `/users/web/surveys/${input.surveyId}/unvote`,
    responseSchema: z.record(z.string(), z.string()),
    retry: false,
    version: "v1",
  });
