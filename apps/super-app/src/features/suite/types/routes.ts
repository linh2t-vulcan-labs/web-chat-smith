export type SuiteTool = "design" | "video" | "";

export interface SuiteToolRoutes {
  HOME: string;
  DETAIL: (id: string) => string;
  VIEW_ALL: string;
}
