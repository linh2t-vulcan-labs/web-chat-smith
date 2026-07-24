import type { ConversationItem } from "@/features/suite/types/conversation";
import type {
  SUITE_DETAIL_ENTRY_TYPE,
  SUITE_PENDING_LOGIN_FLOW,
  SUITE_PROMPTING_ACTION_TYPE,
} from "@/features/suite/utils/constants/main-flow";
import type { SUITE_TOOL_ROUTES } from "@/features/suite/utils/constants/route";

export type SuitePromptingTool = keyof typeof SUITE_TOOL_ROUTES;

export type SuitePromptingRoutes =
  (typeof SUITE_TOOL_ROUTES)[SuitePromptingTool];

export type SuitePromptingTargetPath = SuitePromptingRoutes["HOME"];

export interface SuiteMainProps {
  isGuest?: boolean;
  tool: SuitePromptingTool;
  // Deep-link entry: a use-case slug (/design-studio/<slug>) renders the home with its chip selected.
  initialUsecaseSlug?: string;
  // Per-request seed for the logo-template shuffle (AC9). Server-generated; see DesignStudioHomeRoute.
  shuffleSeed?: number;
}

export type UseSuiteMainFlowOptions = SuiteMainProps & {
  routes: SuitePromptingRoutes;
  // The surface's base URL the back button returns to. Defaults to routes.HOME; the view-all page
  // passes routes.VIEW_ALL so backing out of a project returns to the list, not home.
  baseRoute?: string;
};

export type PendingLoginFlow =
  (typeof SUITE_PENDING_LOGIN_FLOW)[keyof typeof SUITE_PENDING_LOGIN_FLOW];

export type SuiteDetailEntryType =
  (typeof SUITE_DETAIL_ENTRY_TYPE)[keyof typeof SUITE_DETAIL_ENTRY_TYPE];

export interface SuiteTemplatePromptAttachment {
  id: string;
  imageUrl?: string;
  thumbnailUrl: string;
  title: string;
}

export interface PendingSuitePromptingSubmitAction {
  flow: typeof SUITE_PENDING_LOGIN_FLOW.PROMPTING;
  type: typeof SUITE_PROMPTING_ACTION_TYPE;
  targetPath: SuitePromptingTargetPath;
  tool: SuitePromptingTool;
  payload: {
    items: ConversationItem[];
    templateAttachment?: undefined;
  };
}

export interface PendingSuiteTemplateUseAction {
  flow: typeof SUITE_PENDING_LOGIN_FLOW.TEMPLATE;
  type: typeof SUITE_PROMPTING_ACTION_TYPE;
  targetPath: SuitePromptingTargetPath;
  tool: SuitePromptingTool;
  payload: {
    items: ConversationItem[];
    templateAttachment?: SuiteTemplatePromptAttachment;
  };
}

export type PendingLoginPromptingAction = PendingSuitePromptingSubmitAction;

export type PendingLoginTemplateAction = PendingSuiteTemplateUseAction;

export type PendingLoginSuiteAction =
  | PendingSuitePromptingSubmitAction
  | PendingSuiteTemplateUseAction;
