export const PENDING_LOGIN_PROMPTING_ACTION_KEY =
  "pending-login-prompting-action";

export const SUITE_PROMPTING_ACTION_TYPE = "suite_prompting_submit";

export const SUITE_PENDING_LOGIN_FLOW = {
  PROMPTING: "prompting",
  TEMPLATE: "template",
} as const;

export const SUITE_DETAIL_ENTRY_TYPE = {
  NEW_PROJECT: "new_project",
  PROJECT: "project",
  PROMPTING: "prompting",
  TEMPLATE: "template",
} as const;

// const MOCK_PENDING_PROMPT_IMAGE_URLS = [
//   "https://picsum.photos/536/354",
//   "https://picsum.photos/id/237/536/354",
// ] as const;
