export const suiteCreativeQueryKeys = {
  createLogoStructure: () =>
    ["suite", "creative", "home", "create-logo-structure"] as const,

  homeSuggestions: () => ["suite", "creative", "home", "suggestions"] as const,

  messageHistory: (projectId: string) =>
    [
      "suite",
      "creative",
      "projects",
      projectId,
      "messages",
      "history",
    ] as const,

  messageSuggestions: (projectId: string, messageId: string) =>
    [
      "suite",
      "creative",
      "projects",
      projectId,
      "messages",
      messageId,
      "suggestions",
    ] as const,

  project: (projectId: string) =>
    ["suite", "creative", "projects", projectId] as const,

  projectImages: (projectId: string) =>
    ["suite", "creative", "projects", projectId, "images"] as const,

  projects: (input?: unknown) =>
    input === undefined
      ? (["suite", "creative", "projects"] as const)
      : (["suite", "creative", "projects", input] as const),

  quota: () => ["suite", "creative", "quota"] as const,

  templates: (input?: unknown) =>
    ["suite", "creative", "templates", input] as const,

  upload: (uploadId: string) =>
    ["suite", "creative", "uploads", uploadId] as const,

  uploadsList: () => ["suite", "creative", "uploads", "list"] as const,
} as const;
