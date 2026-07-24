import type { SuiteResult } from "@/features/suite/types/http";

import type {
  SuiteCreativeProjectModel,
  TSuiteCreativeCreateProjectInput,
  TSuiteCreativeDeleteProjectInput,
  TSuiteCreativeGetProjectInput,
  TSuiteCreativeListProjectsInput,
  TSuiteCreativeListProjectsResult,
  TSuiteCreativeRenameProjectInput,
} from "../project";

export interface TSuiteCreativeProjectServiceAPIs {
  createProject: (
    input: TSuiteCreativeCreateProjectInput
  ) => SuiteResult<SuiteCreativeProjectModel>;
  listProjects: (
    input?: TSuiteCreativeListProjectsInput
  ) => SuiteResult<TSuiteCreativeListProjectsResult>;
  getProject: (
    input: TSuiteCreativeGetProjectInput
  ) => SuiteResult<SuiteCreativeProjectModel>;
  renameProject: (
    input: TSuiteCreativeRenameProjectInput
  ) => SuiteResult<SuiteCreativeProjectModel>;
  deleteProject: (
    input: TSuiteCreativeDeleteProjectInput
  ) => SuiteResult<Record<string, never>>;
}
