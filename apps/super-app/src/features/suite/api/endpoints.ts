// const SUITE_UPLOAD_FILE_ENDPOINTS = {
//   createFile: "/api/v1/users/web/files",
//   createFilesFromUrls: "api/v1/users/web/files/from-urls",
//   downloadFile: (fileId: string) =>
//     `/api/v1/users/web/files/${fileId}/download`,
// } as const;

export const SUITE_CREATIVE_STUDIO_API_BASE_PATH =
  "/creative-studio/v1/creative";
export const SUITE_CREATIVE_STUDIO_PROJECTS_ENDPOINT = `${SUITE_CREATIVE_STUDIO_API_BASE_PATH}/projects`;
export const SUITE_CREATIVE_STUDIO_UPLOADS_ENDPOINT = `${SUITE_CREATIVE_STUDIO_API_BASE_PATH}/uploads`;

export const SUITE_CREATIVE_STUDIO_ENDPOINTS = {
  createLogoStructure: `${SUITE_CREATIVE_STUDIO_API_BASE_PATH}/home/create-logo-structure`,
  homeSuggestions: `${SUITE_CREATIVE_STUDIO_API_BASE_PATH}/home/suggestions`,
  imageExport: (projectId: string, imageId: string) =>
    `${SUITE_CREATIVE_STUDIO_ENDPOINTS.images(projectId)}/${imageId}/export`,
  images: (projectId: string) =>
    `${SUITE_CREATIVE_STUDIO_ENDPOINTS.project(projectId)}/images`,
  message: (projectId: string, messageId: string) =>
    `${SUITE_CREATIVE_STUDIO_ENDPOINTS.messages(projectId)}/${messageId}`,
  messageHistory: (projectId: string) =>
    `${SUITE_CREATIVE_STUDIO_ENDPOINTS.messages(projectId)}/history`,
  messageStream: (projectId: string, messageId: string) =>
    `${SUITE_CREATIVE_STUDIO_ENDPOINTS.message(projectId, messageId)}/stream`,
  messageSuggestions: (projectId: string, messageId: string) =>
    `${SUITE_CREATIVE_STUDIO_ENDPOINTS.message(projectId, messageId)}/suggestions`,
  messages: (projectId: string) =>
    `${SUITE_CREATIVE_STUDIO_ENDPOINTS.project(projectId)}/messages`,
  project: (projectId: string) =>
    `${SUITE_CREATIVE_STUDIO_PROJECTS_ENDPOINT}/${projectId}`,
  projectTitle: (projectId: string) =>
    `${SUITE_CREATIVE_STUDIO_ENDPOINTS.project(projectId)}/title`,
  projects: SUITE_CREATIVE_STUDIO_PROJECTS_ENDPOINT,
  quota: `${SUITE_CREATIVE_STUDIO_API_BASE_PATH}/quota`,
  templates: `${SUITE_CREATIVE_STUDIO_API_BASE_PATH}/templates`,
  upload: (uploadId: string) =>
    `${SUITE_CREATIVE_STUDIO_UPLOADS_ENDPOINT}/${uploadId}`,
  uploadComplete: (uploadId: string) =>
    `${SUITE_CREATIVE_STUDIO_ENDPOINTS.upload(uploadId)}/complete`,
  uploads: SUITE_CREATIVE_STUDIO_UPLOADS_ENDPOINT,
} as const;
