import type { EAUTH_PROVIDER, EAUTH_SOURCE } from "@/utils/commons/enums";
import type { TPurchaseSource } from "@/utils/commons/types";

export enum EventKeys {
  MainLeftSidebarConvSelect = "main_leftsidebar_conversation_select", // [Growth] Update
  SendingMessageClicked = "web_chat_send",
  MainLeftSidebarConversationDelete = "main_leftsidebar_conversation_delete", // [Growth] Update
  MainLeftSidebarConversationRename = "main_leftsidebar_conversation_rename", // [Growth] Update
  CopyContentClicked = "web_bot_reply_copy_tap",
  RegenerateContentClicked = "web_bot_reply_regenerate_tap",
  ViewGPTModelClicked = "web_gpt_model_view",
  SwitchingGPTModelClicked = "chat_switch_model",
  MainLogout = "main_log_out", // [Growth] Update
  SubscribeAgainClicked = "web_premium_resubscribe",
  NeedHelpPremiumClicked = "web_premium_need_help",
  DSOpen = "ds_open", // [Growth] Update
  DSAutoOpen = "ds_auto_open", // [Growth] Update
  PackageSelected = "ds_package_selected", // [Growth] Update
  DSPurchaseSuccess = "purchase", // [Growth] Update
  DSPurchaseFailed = "ds_purchase_failed", // [Growth] Update
  PremiumPackageManage = "premium_package_manage", // [Growth] Update
  PackagePurchaseSource = "package_purchase_source",
  SignUpSuccess = "signup_success", // [Growth] Update
  SignInStart = "signin_start", // [Growth] Update
  SignInSuccess = "signin_success", // [Growth] Update
  SignInFailed = "signin_failed", // [Growth] Update
  RefreshTokenFailed = "refresh_token_failed", // [Growth] Update
  OnboardingStart = "onboarding_start",
  OnboardingComplete = "onboarding_complete",
  OnboardingPersona = "onboarding_persona",
  OnboardingInterest = "onboarding_interest",

  PackagePurchasedWeekly = "package_purchased_weekly",
  PackagePurchasedMonthly = "package_purchased_monthly",
  PackagePurchasedQuarterly = "package_purchased_quarterly",
  PackagePurchasedYearly = "package_purchased_yearly",
  LandingPageView = "landingpage_view", // [Growth]
  LandingPageStartChatting = "landingpage_start_chatting", // [Growth]
  LandingPageDownloadApp = "landingpage_download_app", // [Growth]
  LandingPageAllInOne = "landingpage_all_in_one", // [Growth]
  LandingPageAllInOneTryNow = "landingpage_all_in_one_try_now",
  LandingPageAccessAnyTimeDownload = "landingpage_access_anytime_download",
  LandingPageAccessAnyTimeTryNow = "landingpage_access_anytime_try_now",
  LandingPageBuiltForYou = "landingpage_built_for_you", // [Growth]
  LandingPageBuiltForYouTryNow = "landingpage_built_for_you_try_now",
  UseCaseView = "homechat_use_case",
  HomeChatView = "homechat_view",
  ChatAttachFile = "chat_attach_file",
  ChatAttachFileDetail = "chat_attach_file_detail",
  // Deep Research
  ChatDeepResearchUsage = "deepresearch_usage",
  ChatDeepResearchSend = "deepresearch_send",
  ChatDeepResearchSendSuccessful = "deepresearch_response",
  ChatDeepResearchSendFailure = "chat_deep_research_send_fail",
  ChatDeepResearchRegenerate = "deepresearch_regenerate",
  ChatDeepResearchCopy = "deepresearch_copy",
  ChatDeepResearchSourceView = "deepresearch_view_source",
  ChatDeepResearchFreeUserTry = "deepresearch_free_user_try",
  ChatDeepResearchHitLimit = "deepresearch_hit_limit",
  ChatDeepResearchExport = "deepresearch_export",
  // AI Art
  ChatArtUsage = "aiart_usage",
  ChatArtSend = "aiart_send",
  ChatArtSendTryNow = "chat_art_send_try_now",
  ChatArtSuccessful = "aiart_response",
  ChatArtRegenerate = "aiart_regenerate",
  ChatArtDownload = "aiart_download",
  ChatArtFreeUserTry = "aiart_free_user_try",
  ChatArtStyleSelect = "aiart_style_select",
  ChatArtLike = "aiart_like",
  ChatArtDislike = "aiart_dislike",
  ChatArtType = "aiart_type",
  ChatArtHitLimit = "aiart_hit_limit",
  ChatArtEditClick = "aiart_edit_click",
  ChatArtEditSend = "aiart_edit_send",
  ChatArtEditSuccessfully = "aiart_edit_response",
  // Web Search
  ChatWebSearchUsage = "websearch_usage",
  ChatWebSearchSend = "websearch_send",
  ChatWebSearchSendSuccessful = "websearch_response",
  ChatWebSearchFail = "chat_web_search_fail",
  ChatWebSearchRegenerate = "websearch_regenerate",
  ChatWebSearchCopy = "websearch_copy",
  ChatWebSearchSourceView = "websearch_source_view",
  ChatWebSearchFreeUserTry = "websearch_free_user_try",
  ChatWebSearchHitLimit = "websearch_hit_limit",

  // AB Test
  HomeChatLeftSidebarDownloadApp = "left_sidebar_download_button_label",

  // New
  LandingPageAccessBlog = "landingpage_access_blog", // [Growth] New
  MainLeftSidebarNewChat = "main_leftsidebar_new_chat", // [Growth] New
  MainLeftSidebarDownloadApp = "main_leftsidebar_download_app", // [Growth] New
  MainLeftSidebarCollapse = "main_leftsidebar_collapse", // [Growth] New
  MainLeftSidebarExpand = "main_leftsidebar_expand", // [Growth] New
  MainWhatsNew = "main_whats_new", // [Growth] New
  MainFeatureRequest = "main_feature_request", // [Growth] New
  MainQuestion = "main_question", // [Growth] New
  MainProfile = "main_profile", // [Growth] New
  MainPrivacy = "main_privacy", // [Growth] New
  MainContactUs = "main_contact_us", // [Growth] New

  // New Assistantwritting
  AssistantwrittingUsage = "assistantwritting_usage", // [Growth] New
  AssistantwrittingSend = "assistantwritting_send", // [Growth] New
  AssistantwrittingEdit = "assistantwritting_edit", // [Growth] New
  AssistantwrittingApply = "assistantwritting_apply", // [Growth] New
  AssistantwrittingRegenerate = "assistantwritting_regenerate", // [Growth] New
  AssistantwrittingResponse = "assistantwritting_response", // [Growth] New

  // Chat
  //Without Params:
  ChatWithImage = "chat_with_image",
  ChatWithImageSend = "chat_with_image_send",
  ChatWithFile = "chat_with_file",
  ChatWithSuggestion = "chat_with_suggestion",
  ChatCopyTap = "chat_copy_tap",
  ChatRegenerateTap = "chat_regenerate_tap",
  ChatLike = "chat_like",
  ChatDislike = "chat_dislike",
  ChatFreeHitLimit = "chat_free_hit_limit",
  //With Params:
  ChatSend = "chat_send",
  ChatResponse = "chat_response",
  ChatSuggestion = "chat_suggestion",
  ChatMessageSuggestionTap = "chat_message_suggestion_tap",

  // Notification
  MainNotificationBell = "main_notification_bell",
  MainNotificationItem = "main_notification_item",
  MainNotificationEnablePermission = "main_notification_enable_permission",
  MainNotificationSkipPermission = "main_notification_skip_permission",
  MainNotificationAllowPermission = "main_notification_allow_permission",
  // Guest Mode
  GuestSignInStart = "guest_signin_start",
  GuestSignInFailed = "guest_signin_failed",
  GuestSignInSuccess = "guest_signin_success",
  GuestSignUpSuccess = "guest_signup_success",
  GuestMainLeftSidebarNewChat = "guest_main_leftsidebar_new_chat",
  GuestMainLeftSidebarDownloadApp = "guest_main_leftsidebar_download_app",
  GuestDSOpen = "guest_ds_open",
  GuestDSPackageSelected = "guest_ds_package_selected",

  GuestHomeChatView = "guest_homechat_view",
  GuestUseCaseView = "guest_homechat_use_case",
  GuestSwitchingGPTModelClicked = "guest_chat_switch_model",
  GuestChatSend = "guest_chat_send",
  GuestChatResponse = "guest_chat_response",
  GuestChatSuggestion = "guest_chat_suggestion",
  GuestChatAttachFile = "guest_chat_attach_file",
  GuestChatWithSuggestion = "guest_chat_with_suggestion",
  GuestChatCopyTap = "guest_chat_copy_tap",
  GuestChatFreeHitLimit = "guest_chat_free_hit_limit",
  GuestChatArtUsage = "guest_aiart_usage",
  GuestChatWebSearchUsage = "guest_websearch_usage",
  GuestChatDeepResearchUsage = "guest_deepresearch_usage",

  //Custom Response
  ChatResponseCustomTap = "chat_response_custom_tap",
  ChatResponseCustomSelect = "chat_response_custom_select",

  // AI tool feature landing page
  FeaturePageSelectStyle = "featurepage_select_style",
  FeaturePageClickHashtag = "featurepage_click_hashtag",
  FeaturePageClickGenerate = "featurepage_click_generate",
  FeaturePageAccessBlog = "featurepage_access_blog",
  FeatureClickSignup = "feature_click_signup",
  PricingPagePackageSelected = "pricingpage_package_selected",
  PricingPageClickSignup = "pricingpage_click_singup",

  // Redesign web
  NewHomepageView = "new_homepage_view",
  NewInputchatClick = "new_inputchat_click",
  NewSuggestionsClick = "new_suggestions_click",
  NewUpgradeClick = "new_upgrade_click",
  NewNavbarClick = "new_navbar_click",
  NewProfileClick = "new_profile_click",
  ChangeTheme = "change_theme",

  // Design Studio (appended at the end to minimize merge conflicts)
  DesignstudioView = "designstudio_view",
  DesignstudioChatSend = "designstudio_chat_send",
  DesignstudioChatAttachFile = "designstudio_chat_attach_file",
  DesignstudioChatModeClick = "designstudio_chat_mode_click",
  DesignstudioImageGen = "designstudio_image_gen",
  DesignstudioTemplateClick = "designstudio_template_click",
  DesignstudioCanvasMarkToEdit = "designstudio_canvas_mark_to_edit",
  DesignstudioAddImageToChat = "designstudio_add_image_to_chat",
  DesignstudioHitLimit = "designstudio_hit_limit",
}

export type TMobileStore = "appStore" | "googleStore";
export type TLinkAction = "openLink" | "copyLink";
export type TNotificationTrigger =
  | "onboarding"
  | "2nd_session"
  | "whats_new"
  | "create_image"
  | "web_search"
  | "deep_research";
export type TDSSource =
  | "banner"
  | "user_menu"
  | "feature"
  | "top_block"
  | "bottom_block";
export type TNewUpgradeTrigger =
  | "nav_bar"
  | "sidebar"
  | "home_page"
  | "profile";
export type TNewNavbarTrigger =
  | "new_chat"
  | "home_page"
  | "history"
  | "writing"
  | "notification"
  | "app_download"
  | "creative_suite";
export type TNewProfileTrigger = "account" | "contact_us";
export type TFeaturePageSection = "banner" | "hero" | "feature" | "step";
export type TFeaturePageFooterSection = "footer";
interface TPackageItem {
  item_id: "day" | "month" | "year" | "quarter" | "week";
  item_name: string;
  price: number;
  quantity: number;
}
interface TTrackingEvent<T> {
  name: T;
}
interface TDSOpen extends TTrackingEvent<EventKeys.DSOpen> {
  payload: {
    vulcan_user_id: string;
    ds_version: number;
    vulcan_source: TDSSource;
  };
}

export type TDSAutoOpenSource =
  | "first_login"
  | "attach_file"
  | "free_turn"
  | "deep_research"
  | "web_search"
  | "ai_art"
  | "assistant-writing";
interface TDSAutoOpen extends TTrackingEvent<EventKeys.DSAutoOpen> {
  payload: {
    vulcan_user_id: string;
    ds_version: number;
    vulcan_source: TDSAutoOpenSource;
  };
}

interface TSignInStart extends TTrackingEvent<EventKeys.SignInStart> {
  payload: {
    signin_method: EAUTH_PROVIDER;
    signin_source?: EAUTH_SOURCE;
  };
}

interface TSignInSuccess extends TTrackingEvent<EventKeys.SignInSuccess> {
  payload: {
    signin_method: EAUTH_PROVIDER;
    signin_time: string;
    vulcan_user_id: string;
    signin_source?: EAUTH_SOURCE;
  };
}
interface TSignUpSuccess extends TTrackingEvent<EventKeys.SignUpSuccess> {
  payload: {
    signin_method: EAUTH_PROVIDER;
    signin_time: string;
    vulcan_user_id: string;
    signin_source?: EAUTH_SOURCE;
  };
}
interface TSignInFailed extends TTrackingEvent<EventKeys.SignInFailed> {
  payload: {
    signin_method: EAUTH_PROVIDER;
    signin_failed_reason: string;
    signin_source?: EAUTH_SOURCE;
  };
}

interface TDSPurchaseSuccess extends TTrackingEvent<EventKeys.DSPurchaseSuccess> {
  payload: {
    vulcan_user_id: string;
    vulcan_source: TPurchaseSource;
    ecommerce: {
      transaction_id: string;
      currency: string;
      value: number;
      items: TPackageItem[];
    };
  };
}
interface TDSPurchaseFailed extends TTrackingEvent<EventKeys.DSPurchaseFailed> {
  payload: {
    vulcan_user_id: string;
    ecommerce: {
      transaction_id: string;
      currency: string;
      value: number;
      items: TPackageItem[];
    };
  };
}
interface TPackageSelected extends TTrackingEvent<EventKeys.PackageSelected> {
  payload: {
    vulcan_user_id: string;
    vulcan_source: TPurchaseSource;
    currency: string;
    value: number;
    transaction_id: string;
    items: TPackageItem[];
  };
}

interface TNeedHelpPremiumClicked extends TTrackingEvent<EventKeys.NeedHelpPremiumClicked> {
  payload: {
    vulcan_user_id: string;
  };
}

interface TMainLeftSidebarConvSelect extends TTrackingEvent<EventKeys.MainLeftSidebarConvSelect> {
  payload: {
    vulcan_user_id: string;
    conversation_id: string;
  };
}
interface TMainLeftSidebarConversationDelete extends TTrackingEvent<EventKeys.MainLeftSidebarConversationDelete> {
  payload: {
    vulcan_user_id: string;
    conversation_id: string;
  };
}
interface TMainLeftSidebarConversationRename extends TTrackingEvent<EventKeys.MainLeftSidebarConversationRename> {
  payload: {
    vulcan_user_id: string;
    conversation_id: string;
  };
}
interface TMainLogout extends TTrackingEvent<EventKeys.MainLogout> {
  payload?: never;
}
interface TPremiumPackageManage extends TTrackingEvent<EventKeys.PremiumPackageManage> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TMainLeftSidebarNewChat extends TTrackingEvent<EventKeys.MainLeftSidebarNewChat> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TMainLeftSidebarDownloadApp extends TTrackingEvent<EventKeys.MainLeftSidebarDownloadApp> {
  payload: {
    vulcan_user_id: string;
    store?: TMobileStore;
    action?: TLinkAction;
  };
}

interface TMainLeftSidebarCollapse extends TTrackingEvent<EventKeys.MainLeftSidebarCollapse> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TMainLeftSidebarExpand extends TTrackingEvent<EventKeys.MainLeftSidebarExpand> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TMainWhatsNew extends TTrackingEvent<EventKeys.MainWhatsNew> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TMainFeatureRequest extends TTrackingEvent<EventKeys.MainFeatureRequest> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TMainQuestion extends TTrackingEvent<EventKeys.MainQuestion> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TMainProfile extends TTrackingEvent<EventKeys.MainProfile> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TMainPrivacy extends TTrackingEvent<EventKeys.MainPrivacy> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TMainContactUs extends TTrackingEvent<EventKeys.MainContactUs> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TAssistantwrittingUsage extends TTrackingEvent<EventKeys.AssistantwrittingUsage> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TAssistantwrittingSend extends TTrackingEvent<EventKeys.AssistantwrittingSend> {
  payload: {
    vulcan_user_id: string;
    tone: string;
    length: string;
    using_technique: string;
  };
}
interface TAssistantwrittingEdit extends TTrackingEvent<EventKeys.AssistantwrittingEdit> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TAssistantwrittingApply extends TTrackingEvent<EventKeys.AssistantwrittingApply> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TAssistantwrittingRegenerate extends TTrackingEvent<EventKeys.AssistantwrittingRegenerate> {
  payload: {
    vulcan_user_id: string;
  };
}
interface TAssistantwrittingResponse extends TTrackingEvent<EventKeys.AssistantwrittingResponse> {
  payload: {
    vulcan_status: "success" | "failed";
  };
}

interface TRefreshTokenFailed extends TTrackingEvent<EventKeys.RefreshTokenFailed> {
  payload?: never; // Don't need any payload
}

export interface TEventOptions {
  enabledAppsflyer?: boolean;
  enabledGTM?: boolean;
}

interface TCommonChatEvent extends TTrackingEvent<
  | EventKeys.HomeChatView
  | EventKeys.ChatWithImage
  | EventKeys.ChatWithImageSend
  | EventKeys.ChatWithFile
  | EventKeys.ChatWithSuggestion
  | EventKeys.ChatCopyTap
  | EventKeys.ChatRegenerateTap
  | EventKeys.ChatLike
  | EventKeys.ChatDislike
  | EventKeys.ChatFreeHitLimit
  | EventKeys.ChatAttachFile
  | EventKeys.ChatResponseCustomTap
> {
  payload: {
    vulcan_user_id: string;
  };
}

interface TChatAttachFileDetail extends TTrackingEvent<EventKeys.ChatAttachFileDetail> {
  payload: {
    vulcan_user_id: string;
    vulcan_status: string;
    file_type: string;
  };
}

interface TChatSend extends TTrackingEvent<EventKeys.ChatSend> {
  payload: {
    vulcan_user_id: string;
    vulcan_type: string;
    vulcan_style?: string;
  };
}

interface TChatResponse extends TTrackingEvent<EventKeys.ChatResponse> {
  payload: {
    vulcan_user_id: string;
    vulcan_status: string;
  };
}

interface TChatMessageSuggestionTap extends TTrackingEvent<EventKeys.ChatMessageSuggestionTap> {
  payload: {
    vulcan_user_id: string;
    vulcan_type: string;
    vulcan_message: string;
  };
}

interface TChatSuggestion extends TTrackingEvent<EventKeys.ChatSuggestion> {
  payload: {
    vulcan_user_id: string;
    vulcan_status: string;
  };
}

interface TUseCaseView extends TTrackingEvent<EventKeys.UseCaseView> {
  payload: {
    vulcan_user_id: string;
    task: string;
    sub_task: string;
  };
}

interface TChatDeepResearch extends TTrackingEvent<
  | EventKeys.ChatDeepResearchUsage
  | EventKeys.ChatDeepResearchSend
  | EventKeys.ChatDeepResearchRegenerate
  | EventKeys.ChatDeepResearchCopy
  | EventKeys.ChatDeepResearchSourceView
  | EventKeys.ChatDeepResearchFreeUserTry
  | EventKeys.ChatDeepResearchHitLimit
  | EventKeys.ChatDeepResearchExport
> {
  payload: {
    vulcan_user_id: string;
  };
}

interface TMainNotificationPermission extends TTrackingEvent<
  | EventKeys.MainNotificationEnablePermission
  | EventKeys.MainNotificationSkipPermission
  | EventKeys.MainNotificationAllowPermission
> {
  payload: {
    vulcan_user_id: string;
    trigger: TNotificationTrigger;
  };
}

interface TChatDeepResearchSendSuccessful extends TTrackingEvent<EventKeys.ChatDeepResearchSendSuccessful> {
  payload: {
    vulcan_user_id: string;
    vulcan_status: string;
  };
}
interface TChatWebSearch extends TTrackingEvent<
  | EventKeys.ChatWebSearchUsage
  | EventKeys.ChatWebSearchSend
  | EventKeys.ChatWebSearchRegenerate
  | EventKeys.ChatWebSearchCopy
  | EventKeys.ChatWebSearchSourceView
  | EventKeys.ChatWebSearchFreeUserTry
  | EventKeys.ChatWebSearchHitLimit
> {
  payload: {
    vulcan_user_id: string;
  };
}

interface TChatWebSearchSendSuccessful extends TTrackingEvent<EventKeys.ChatWebSearchSendSuccessful> {
  payload: {
    vulcan_user_id: string;
    vulcan_status: string;
  };
}

interface TChatArt extends TTrackingEvent<
  | EventKeys.ChatArtUsage
  | EventKeys.ChatArtSend
  | EventKeys.ChatArtSendTryNow
  | EventKeys.ChatArtRegenerate
  | EventKeys.ChatArtDownload
  | EventKeys.ChatArtFreeUserTry
  | EventKeys.ChatArtStyleSelect
  | EventKeys.ChatArtLike
  | EventKeys.ChatArtDislike
  | EventKeys.ChatArtHitLimit
  | EventKeys.ChatArtEditClick
  | EventKeys.ChatArtEditSend
  | EventKeys.ChatArtEditSuccessfully
  | EventKeys.MainNotificationBell
  | EventKeys.MainNotificationItem
> {
  payload: {
    vulcan_user_id: string;
  };
}

interface TChatArtUsage extends TTrackingEvent<EventKeys.ChatArtUsage> {
  payload: {
    vulcan_user_id: string;
    vulcan_type: "text2image" | "image2image";
    model: string;
  };
}

interface ChatArtSuccessful extends TTrackingEvent<EventKeys.ChatArtSuccessful> {
  payload: {
    vulcan_user_id: string;
    vulcan_status: string;
  };
}

interface ChatArtStyleSelect extends TTrackingEvent<EventKeys.ChatArtStyleSelect> {
  payload: {
    vulcan_user_id: string;
    vulcan_style: string;
  };
}

interface ChatArtType extends TTrackingEvent<EventKeys.ChatArtType> {
  payload: {
    vulcan_user_id: string;
    vulcan_type: string;
    model?: string;
  };
}

interface ChatArtEditSuccessfully extends TTrackingEvent<EventKeys.ChatArtEditSuccessfully> {
  payload: {
    vulcan_user_id: string;
    vulcan_status: string;
  };
}

interface ChatArtEditClick extends TTrackingEvent<EventKeys.ChatArtEditClick> {
  payload: {
    vulcan_user_id: string;
  };
}

interface ChatArtEditSend extends TTrackingEvent<EventKeys.ChatArtEditSend> {
  payload: {
    vulcan_user_id: string;
  };
}

interface SwitchingGPTModelClicked extends TTrackingEvent<EventKeys.SwitchingGPTModelClicked> {
  payload: {
    vulcan_user_id: string;
    model_name: string;
  };
}

export type TGuestSignInState =
  | "sidebar"
  | "header"
  | "new chat"
  | "model"
  | "ds"
  | "chat_quota"
  | "task"
  | "advance_mode"
  | "attach_file"
  | "assistant-writing";

interface TGuestSignInStart extends TTrackingEvent<EventKeys.GuestSignInStart> {
  payload: {
    guest_id: string;
    vulcan_state?: TGuestSignInState;
    signin_source?: EAUTH_SOURCE;
  };
}

interface TGuestSignInFailed extends TTrackingEvent<EventKeys.GuestSignInFailed> {
  payload: {
    guest_id: string;
    signin_failed_reason: string;
    signin_method: EAUTH_PROVIDER;
    signin_source?: EAUTH_SOURCE;
  };
}

interface TGuestSignInSuccess extends TTrackingEvent<EventKeys.GuestSignInSuccess> {
  payload: {
    guest_id: string;
    signin_method: EAUTH_PROVIDER;
    signin_source?: EAUTH_SOURCE;
    signin_time: string;
    vulcan_user_id: string;
  };
}

interface TGuestSignUpSuccess extends TTrackingEvent<EventKeys.GuestSignUpSuccess> {
  payload: {
    guest_id: string;
    signin_method: EAUTH_PROVIDER;
    signin_source?: EAUTH_SOURCE;
    signin_time: string;
    vulcan_user_id: string;
  };
}

interface TGuestDSPackageSelected extends TTrackingEvent<EventKeys.GuestDSPackageSelected> {
  payload: {
    guest_id: string;
    ecommerce: {
      items: TPackageItem[];
      currency: string;
      value: number;
    };
  };
}

interface TGuestChatEvent extends TTrackingEvent<
  | EventKeys.GuestMainLeftSidebarNewChat
  | EventKeys.GuestMainLeftSidebarDownloadApp
  | EventKeys.GuestDSOpen
  | EventKeys.GuestHomeChatView
  | EventKeys.GuestSwitchingGPTModelClicked
  | EventKeys.GuestChatSend
  | EventKeys.GuestChatResponse
  | EventKeys.GuestChatSuggestion
  | EventKeys.GuestChatAttachFile
  | EventKeys.GuestChatWithSuggestion
  | EventKeys.GuestChatCopyTap
  | EventKeys.GuestChatFreeHitLimit
  | EventKeys.GuestChatArtUsage
  | EventKeys.GuestChatWebSearchUsage
  | EventKeys.GuestChatDeepResearchUsage
> {
  payload: {
    guest_id: string;
  };
}

interface GuestHomeChatUseCase extends TTrackingEvent<EventKeys.GuestUseCaseView> {
  payload: {
    guest_id: string;
    task: string;
  };
}

interface TChatResponseCustomSelect extends TTrackingEvent<EventKeys.ChatResponseCustomSelect> {
  payload: {
    vulcan_user_id: string;
    vulcan_style: string;
  };
}

interface TNewHomepageView extends TTrackingEvent<EventKeys.NewHomepageView> {
  payload: {
    vulcan_user_id?: string;
  };
}

interface TNewInputchatClick extends TTrackingEvent<EventKeys.NewInputchatClick> {
  payload: {
    vulcan_user_id?: string;
  };
}

interface TNewSuggestionsClick extends TTrackingEvent<EventKeys.NewSuggestionsClick> {
  payload: {
    vulcan_user_id?: string;
  };
}

interface TNewUpgradeClick extends TTrackingEvent<EventKeys.NewUpgradeClick> {
  payload: {
    trigger: TNewUpgradeTrigger;
    vulcan_user_id?: string;
    guest_id?: string;
  };
}

interface TNewNavbarClick extends TTrackingEvent<EventKeys.NewNavbarClick> {
  payload: {
    trigger: TNewNavbarTrigger;
    vulcan_user_id?: string;
    guest_id?: string;
  };
}

interface TNewProfileClick extends TTrackingEvent<EventKeys.NewProfileClick> {
  payload: {
    trigger: TNewProfileTrigger;
    vulcan_user_id?: string;
    guest_id?: string;
  };
}

interface TChangeTheme extends TTrackingEvent<EventKeys.ChangeTheme> {
  payload: {
    value: "dark" | "light" | "system";
    vulcan_user_id?: string;
    guest_id?: string;
  };
}

interface TFeaturePageSelectStyle extends TTrackingEvent<EventKeys.FeaturePageSelectStyle> {
  payload: {
    section: TFeaturePageSection;
  };
}

interface TFeaturePageClickHashtag extends TTrackingEvent<EventKeys.FeaturePageClickHashtag> {
  payload?: never;
}

interface TFeaturePageClickGenerate extends TTrackingEvent<EventKeys.FeaturePageClickGenerate> {
  payload: {
    section: TFeaturePageSection;
  };
}

interface TFeaturePageAccessBlog extends TTrackingEvent<EventKeys.FeaturePageAccessBlog> {
  payload?: never;
}

interface TFeatureClickSignup extends TTrackingEvent<EventKeys.FeatureClickSignup> {
  payload: {
    section: TFeaturePageFooterSection;
  };
}

interface TPricingPagePackageSelected extends TTrackingEvent<EventKeys.PricingPagePackageSelected> {
  payload?: never;
}

interface TPricingPageClickSignup extends TTrackingEvent<EventKeys.PricingPageClickSignup> {
  payload?: never;
}

export type TSendEventPayload =
  | TDSOpen
  | TDSAutoOpen
  | TSignInStart
  | TSignInSuccess
  | TSignUpSuccess
  | TSignInFailed
  | TDSPurchaseSuccess
  | TDSPurchaseFailed
  | TPackageSelected
  | TMainLeftSidebarConvSelect
  | TMainLeftSidebarConversationDelete
  | TMainLeftSidebarConversationRename
  | TMainLogout
  | TRefreshTokenFailed
  | TPremiumPackageManage
  | TNeedHelpPremiumClicked
  | TMainLeftSidebarNewChat
  | TMainLeftSidebarDownloadApp
  | TMainLeftSidebarCollapse
  | TMainLeftSidebarExpand
  | TMainWhatsNew
  | TMainFeatureRequest
  | TMainQuestion
  | TMainProfile
  | TMainPrivacy
  | TMainContactUs
  | TAssistantwrittingUsage
  | TAssistantwrittingSend
  | TAssistantwrittingEdit
  | TAssistantwrittingApply
  | TAssistantwrittingRegenerate
  | TAssistantwrittingResponse
  | TCommonChatEvent
  | TChatAttachFileDetail
  | TChatSend
  | TChatResponse
  | TChatSuggestion
  | TChatMessageSuggestionTap
  | TUseCaseView
  | TChatDeepResearch
  | TChatDeepResearchSendSuccessful
  | TChatWebSearch
  | TChatWebSearchSendSuccessful
  | TChatArt
  | TChatArtUsage
  | ChatArtSuccessful
  | ChatArtType
  | ChatArtStyleSelect
  | ChatArtEditSuccessfully
  | ChatArtEditClick
  | ChatArtEditSend
  | SwitchingGPTModelClicked
  | TGuestChatEvent
  | TGuestSignInStart
  | GuestHomeChatUseCase
  | TGuestDSPackageSelected
  | TGuestSignInFailed
  | TGuestSignInSuccess
  | TGuestSignUpSuccess
  | TChatResponseCustomSelect
  | TMainNotificationPermission
  | TNewHomepageView
  | TNewInputchatClick
  | TNewSuggestionsClick
  | TNewUpgradeClick
  | TNewNavbarClick
  | TNewProfileClick
  | TChangeTheme
  | TFeaturePageSelectStyle
  | TFeaturePageClickHashtag
  | TFeaturePageClickGenerate
  | TFeaturePageAccessBlog
  | TFeatureClickSignup
  | TPricingPagePackageSelected
  | TPricingPageClickSignup
  // Design Studio
  | TDesignstudioView
  | TDesignstudioChatSend
  | TDesignstudioChatAttachFile
  | TDesignstudioChatModeClick
  | TDesignstudioImageGen
  | TDesignstudioTemplateClick
  | TDesignstudioCanvasMarkToEdit
  | TDesignstudioAddImageToChat
  | TDesignstudioHitLimit;

// ─── Design Studio event payloads ──────────────────────────────────────────────

// vulcan_user_id is optional on these — they fire for guests too (spec: "if any").
interface TDesignstudioView extends TTrackingEvent<EventKeys.DesignstudioView> {
  payload: { vulcan_user_id?: string };
}
interface TDesignstudioChatSend extends TTrackingEvent<EventKeys.DesignstudioChatSend> {
  payload: { vulcan_user_id?: string };
}
interface TDesignstudioChatAttachFile extends TTrackingEvent<EventKeys.DesignstudioChatAttachFile> {
  payload: { vulcan_user_id?: string };
}
interface TDesignstudioChatModeClick extends TTrackingEvent<EventKeys.DesignstudioChatModeClick> {
  payload: { vulcan_user_id: string; value: string };
}
// Fired once when an image generation request completes (success or failed). action distinguishes
// the kind of request: first logo, first general image, or an edit.
interface TDesignstudioImageGen extends TTrackingEvent<EventKeys.DesignstudioImageGen> {
  payload: {
    vulcan_user_id: string;
    vulcan_status: "success" | "failed";
    vulcan_type: "with template" | "no template";
    action: "create logo" | "create image" | "edit image" | "";
  };
}
interface TDesignstudioTemplateClick extends TTrackingEvent<EventKeys.DesignstudioTemplateClick> {
  payload: { vulcan_user_id: string };
}
interface TDesignstudioCanvasMarkToEdit extends TTrackingEvent<EventKeys.DesignstudioCanvasMarkToEdit> {
  payload: { vulcan_user_id: string };
}
interface TDesignstudioAddImageToChat extends TTrackingEvent<EventKeys.DesignstudioAddImageToChat> {
  payload: { vulcan_user_id: string };
}
interface TDesignstudioHitLimit extends TTrackingEvent<EventKeys.DesignstudioHitLimit> {
  payload: { vulcan_user_id: string };
}
