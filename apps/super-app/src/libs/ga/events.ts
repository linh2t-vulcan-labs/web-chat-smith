"use client";

import { sendGAEvent } from "@next/third-parties/google";

import type { EAIValueModel } from "@/core/models/model";
import type { EAUTH_PROVIDER } from "@/utils/commons/enums";
import { extractCurrencyCode, toCamelCase } from "@/utils/commons/string";
import type { TPurchaseSource } from "@/utils/commons/types";

const EventKeys = {
  Login: "web_login",
  LoginFailed: "web_login_failed",
  LoginNoneWhitelist: "web_login_none_whitelist",
  LoginSuccessfully: "web_chat_access",
  CreattingMoreConversationClicked: "web_chat_conversation_more_tap",
  SendingMessageClicked: "web_chat_send",
  DeletingConversationClicked: "web_chat_conversation_delete_tap",
  RenamingConversationClicked: "web_chat_conversation_rename_tap",
  CopyContentClicked: "web_bot_reply_copy_tap",
  RegenerateContentClicked: "web_bot_reply_regenerate_tap",
  ViewGPTModelClicked: "web_gpt_model_view",
  SwitchingGPTModelClicked: "web_gpt_model_switch",
  ViewModelPremiumClicked: "web_premium_panel",
  NeedHelpAccountDetailClicked: "web_premium_need_help",
  LogoutClicked: "web_log_out",
  SubscribeAgainClicked: "web_premium_resubscribe",
  NeedHelpPremiumClicked: "web_premium_need_help",
  PackageOpenClicked: "DS_open",
  PackageAutoOpen: "DS_auto_open",
  PackageSelectedClicked: "package_selected",
  PackagePurchase: "purchase",
  PackagePurchaseSuccessfully: "package_purchase_successfully",
  PackagePurchaseFailed: "package_purchase_failed",
  PackageManageClicked: "package_manage",
  PackagePurchaseSource: "package_purchase_source",
  SignUpComplete: "sign_up_complete",
  SignInStart: "sign_in_start",
  SignInType: "type_of_sign_in",
  SignInComplete: "sign_in_complete",
  TimeToCompleteSignIn: "time_to_complete_sign_in",
  SignInFailed: "sign_in_failed",
  RefreshTokenFailed: "refresh_token_failed",
  OnboardingStart: "onboarding_start",
  OnboardingComplete: "onboarding_complete",
  OnboardingPersona: "onboarding_persona",
  OnboardingInterest: "onboarding_interest",
  PackagePurchasedWeekly: "package_purchased_weekly",
  PackagePurchasedMonthly: "package_purchased_monthly",
  PackagePurchasedQuarterly: "package_purchased_quarterly",
  PackagePurchasedYearly: "package_purchased_yearly",
  LandingPageView: "landingpage_view",
  LandingPageStartChatting: "landingpage_start_chatting",
  LandingPageDownloadApp: "landingpage_download_app",
  LandingPageAllInOne: "landingpage_all_in_one",
  LandingPageAllInOneTryNow: "landingpage_all_in_one_try_now",
  LandingPageAccessAnyTimeDownload: "landingpage_access_anytime_download",
  LandingPageAccessAnyTimeTryNow: "landingpage_access_anytime_try_now",
  LandingPageBuiltForYou: "landingpage_built_for_you",
  LandingPageBuiltForYouTryNow: "landingpage_built_for_you_try_now",
  UseCaseView: "use_case_view",
  HomeChatView: "home_chat_view",
  ChatAttachFile: "chat_attach_file",
  ChatAttachFileDetail: "chat_attach_file_detail",
  // Deep Research
  ChatDeepResearchUsage: "chat_deep_research_usage",
  ChatDeepResearchSend: "chat_deep_research_send",
  ChatDeepResearchSendSuccessful: "chat_deep_research_send_successful",
  ChatDeepResearchSendFailure: "chat_deep_research_send_fail",
  ChatDeepResearchRegenerate: "chat_deep_research_regenerate",
  ChatDeepResearchCopy: "chat_deep_research_copy",
  ChatDeepResearchSourceView: "chat_deep_research_source_view",
  ChatDeepResearchHitLimit: "chat_deep_research_hit_limit",
  // AI Art
  ChatArtUsage: "chat_art_usage",
  ChatArtSend: "chat_art_send",
  ChatArtSendTryNow: "chat_art_send_try_now",
  ChatArtSuccessful: "chat_art_successful",
  ChatArtFail: "chat_art_fail",
  ChatArtRegenerate: "chat_art_regenerate",
  ChatArtDownload: "chat_art_download",
  ChatArtFreeUserTry: "chat_art_free_user_try",
  ChatArtHitLimit: "chat_art_hit_limit",
  ChatArtEditClick: "chat_art_edit_click",
  ChatArtEditSend: "chat_art_edit_send",
  ChatArtEditSuccessfully: "chat_art_edit_send_successfully",
  // Web Search
  ChatWebSearchUsage: "chat_web_search_usage",
  ChatWebSearchSend: "chat_web_search_send",
  ChatWebSearchSuccessful: "chat_web_search_successful",
  ChatWebSearchFail: "chat_web_search_fail",
  ChatWebSearchRegenerate: "chat_web_search_regenerate",
  ChatWebSearchCopy: "chat_web_search_copy",
  ChatWebSearchSourceView: "chat_web_search_source_view",
  ChatWebSearchFreeUserTry: "chat_web_search_free_user_try",
  ChatWebSearchHitLimit: "chat_web_search_hit_limit",

  // AB Test
  LeftSidebarDownloadButtonLabel: "left_sidebar_download_button_label",
};

export const GAEvents = {
  Login: (provider: "google" | "apple" | "facebook") => {
    sendGAEvent("event", EventKeys.Login, { provider });
  },
  LoginFailed: () => {
    sendGAEvent("event", EventKeys.LoginFailed, { value: "" });
  },
  LoginNoneWhitelist: () => {
    sendGAEvent("event", EventKeys.LoginNoneWhitelist, { value: "" });
  },
  LoginSuccessfully: () => {
    sendGAEvent("event", EventKeys.LoginSuccessfully, { value: "" });
  },
  CreattingMoreConversationClicked: () => {
    sendGAEvent("event", EventKeys.CreattingMoreConversationClicked, {
      value: "",
    });
  },
  SendingMessageClicked: () => {
    sendGAEvent("event", EventKeys.SendingMessageClicked, { value: "" });
  },
  DeletingConversationClicked: () => {
    sendGAEvent("event", EventKeys.DeletingConversationClicked, { value: "" });
  },
  RenamingConversationClicked: () => {
    sendGAEvent("event", EventKeys.RenamingConversationClicked, { value: "" });
  },
  CopyContentClicked: () => {
    sendGAEvent("event", EventKeys.CopyContentClicked, { value: "" });
  },
  RegenerateContentClicked: () => {
    sendGAEvent("event", EventKeys.RegenerateContentClicked, { value: "" });
  },
  ViewGPTModelClicked: () => {
    sendGAEvent("event", EventKeys.ViewGPTModelClicked, { value: "" });
  },
  SwitchingGPTModelClicked: (model: EAIValueModel, vulcanUserId: string) => {
    sendGAEvent("event", EventKeys.SwitchingGPTModelClicked, {
      model_name: model,
      vulcan_user_id: vulcanUserId,
    });
  },
  ViewModalPremiumClicked: () => {
    sendGAEvent("event", EventKeys.ViewModelPremiumClicked, { value: "" });
  },
  NeedHelpAccountDetailClicked: () => {
    sendGAEvent("event", EventKeys.NeedHelpAccountDetailClicked, { value: "" });
  },
  LogoutClicked: () => {
    sendGAEvent("event", EventKeys.LogoutClicked, { value: "" });
  },
  SubscribeAgainClicked: () => {
    sendGAEvent("event", EventKeys.SubscribeAgainClicked, { value: "" });
  },
  NeedHelpPremiumClicked: () => {
    sendGAEvent("event", EventKeys.NeedHelpPremiumClicked, { value: "" });
  },
  PackageOpenClicked: (
    vulcanUserId: string,
    openForm: "banner" | "user_menu" | "top_block" | "bottom_block"
  ) => {
    sendGAEvent("event", EventKeys.PackageOpenClicked, {
      ds_version: 2,
      package_open_clicked_source: openForm,
      source: openForm,
      vulcan_user_id: vulcanUserId,
    });
  },
  PackageAutoOpen: (vulcanUserId: string, source: TPurchaseSource) => {
    sendGAEvent("event", EventKeys.PackageAutoOpen, {
      ds_version: 2,
      package_auto_open_source: source,
      source,
      vulcan_user_id: vulcanUserId,
    });
  },
  PackageSelectedClicked: (vulcanUserId: string, packageName: string) => {
    sendGAEvent("event", EventKeys.PackageSelectedClicked, {
      ds_version: 2,
      package_name: packageName,
      vulcan_user_id: vulcanUserId,
    });
  },
  PackagePurchase: (params: {
    vulcanUserId: string;
    orderId: string;
    packageName: string;
    price: number;
    currency: string;
  }) => {
    sendGAEvent("event", EventKeys.PackagePurchase, {
      currency: extractCurrencyCode(params.currency),
      ds_version: 2,
      package_name: params.packageName,
      transaction_id: params.orderId,
      value: params.price,
      vulcan_user_id: params.vulcanUserId,
    });
  },
  PackagePurchaseSuccessfully: (params: {
    vulcanUserId: string;
    orderId: string;
    packageName: string;
    price: number;
    currency: string;
  }) => {
    sendGAEvent("event", EventKeys.PackagePurchaseSuccessfully, {
      currency: extractCurrencyCode(params.currency),
      ds_version: 2,
      package_name: params.packageName,
      transaction_id: params.orderId,
      value: params.price,
      vulcan_user_id: params.vulcanUserId,
    });
  },
  PackagePurchaseFailed: (vulcanUserId: string, packageName: string) => {
    sendGAEvent("event", EventKeys.PackagePurchaseFailed, {
      ds_version: 2,
      package_name: packageName,
      vulcan_user_id: vulcanUserId,
    });
  },
  PackagePurchasedWeekly: (vulcanUserId: string) => {
    sendGAEvent("event", EventKeys.PackagePurchasedWeekly, {
      ds_version: 2,
      vulcan_user_id: vulcanUserId,
    });
  },
  PackagePurchasedMonthly: (vulcanUserId: string) => {
    sendGAEvent("event", EventKeys.PackagePurchasedMonthly, {
      ds_version: 2,
      vulcan_user_id: vulcanUserId,
    });
  },
  PackagePurchasedQuarterly: (vulcanUserId: string) => {
    sendGAEvent("event", EventKeys.PackagePurchasedQuarterly, {
      ds_version: 2,
      vulcan_user_id: vulcanUserId,
    });
  },
  PackagePurchasedYearly: (vulcanUserId: string) => {
    sendGAEvent("event", EventKeys.PackagePurchasedYearly, {
      ds_version: 2,
      vulcan_user_id: vulcanUserId,
    });
  },
  PackageManageClicked: (vulcanUserId: string) => {
    sendGAEvent("event", EventKeys.PackageManageClicked, {
      ds_version: 2,
      vulcan_user_id: vulcanUserId,
    });
  },
  PackagePurchaseSource: (vulcanUserId: string, source: TPurchaseSource) => {
    sendGAEvent("event", EventKeys.PackagePurchaseSource, {
      package_purchase_source: source,
      source,
      vulcan_user_id: vulcanUserId,
    });
  },
  SignUpComplete: () => {
    sendGAEvent("event", EventKeys.SignUpComplete);
  },
  SignInStart: () => {
    sendGAEvent("event", EventKeys.SignInStart);
  },
  SignInType: (os: string, sso: EAUTH_PROVIDER) => {
    const formattedSso = toCamelCase(sso);

    sendGAEvent("event", EventKeys.SignInType, {
      OS: os,
      SSO: formattedSso,
    });
  },
  SignInComplete: () => {
    sendGAEvent("event", EventKeys.SignInComplete);
  },
  TimeToCompleteSignIn: (time: string) => {
    sendGAEvent("event", EventKeys.TimeToCompleteSignIn, {
      time,
    });
  },
  SignInFailed: (reason: string) => {
    sendGAEvent("event", EventKeys.SignInFailed, {
      reason,
    });
  },
  RefreshTokenFailed: (userId: string) => {
    sendGAEvent("event", EventKeys.RefreshTokenFailed, {
      vulcan_user_id: userId,
    });
  },
  OnboardingStart: () => {
    sendGAEvent("event", EventKeys.OnboardingStart);
  },
  OnboardingComplete: (completeTime: string) => {
    sendGAEvent("event", EventKeys.OnboardingComplete, {
      complete_time: completeTime,
    });
  },
  OnboardingPersona: (personalData: string) => {
    sendGAEvent("event", EventKeys.OnboardingPersona, {
      personal_data: personalData,
    });
  },
  OnboardingInterest: (
    personalData: string,
    interestData: string[],
    userId: string
  ) => {
    sendGAEvent("event", EventKeys.OnboardingInterest, {
      interest_data: interestData,
      personal_data: personalData,
      vulcan_user_id: userId,
    });
  },
  LandingPageView: () => {
    sendGAEvent("event", EventKeys.LandingPageView);
  },
  LandingPageStartChatting: () => {
    sendGAEvent("event", EventKeys.LandingPageStartChatting);
  },
  LandingPageDownloadApp: (store: "appStore" | "googleStore") => {
    sendGAEvent("event", EventKeys.LandingPageDownloadApp, {
      store,
    });
  },
  LandingPageAllInOne: (categories: string) => {
    sendGAEvent("event", EventKeys.LandingPageAllInOne, {
      categories,
    });
  },
  LandingPageAllInOneTryNow: () => {
    sendGAEvent("event", EventKeys.LandingPageAllInOneTryNow);
  },
  LandingPageAccessAnyTimeDownload: () => {
    sendGAEvent("event", EventKeys.LandingPageAccessAnyTimeDownload);
  },
  LandingPageAccessAnyTimeTryNow: () => {
    sendGAEvent("event", EventKeys.LandingPageAccessAnyTimeDownload);
  },
  LandingPageBuiltForYou: (segment: string) => {
    sendGAEvent("event", EventKeys.LandingPageBuiltForYou, {
      segment,
    });
  },
  LandingPageBuiltForYouTryNow: () => {
    sendGAEvent("event", EventKeys.LandingPageBuiltForYouTryNow);
  },
  HomeChatView: () => {
    sendGAEvent("event", EventKeys.HomeChatView);
  },
  UseCaseView: () => {
    sendGAEvent("event", EventKeys.UseCaseView);
  },
  UseCaseSelected: (eventName: string, userId: string) => {
    sendGAEvent("event", eventName, {
      vulcan_user_id: userId,
    });
  },
  ChatAttachFile: () => {
    sendGAEvent("event", EventKeys.ChatAttachFile);
  },
  ChatAttachFileDetail: (mimeType: string) => {
    sendGAEvent("event", EventKeys.ChatAttachFileDetail, {
      mime_type: mimeType,
    });
  },
  ChatDeepResearchUsage: () => {
    sendGAEvent("event", EventKeys.ChatDeepResearchUsage);
  },
  ChatDeepResearchSend: () => {
    sendGAEvent("event", EventKeys.ChatDeepResearchSend);
  },
  ChatDeepResearchRegenerate: () => {
    sendGAEvent("event", EventKeys.ChatDeepResearchRegenerate);
  },
  ChatDeepResearchCopy: () => {
    sendGAEvent("event", EventKeys.ChatDeepResearchCopy);
  },
  ChatDeepResearchSourceView: () => {
    sendGAEvent("event", EventKeys.ChatDeepResearchSourceView);
  },
  ChatDeepResearchHitLimit: () => {
    sendGAEvent("event", EventKeys.ChatDeepResearchHitLimit);
  },
  ChatDeepResearchSendSuccessful: () => {
    sendGAEvent("event", EventKeys.ChatDeepResearchSendSuccessful);
  },
  ChatDeepResearchSendFailure: () => {
    sendGAEvent("event", EventKeys.ChatDeepResearchSendFailure);
  },
  // AI Art
  ChatArtUsage: (style: string) => {
    sendGAEvent("event", EventKeys.ChatArtUsage, {
      style,
    });
  },
  ChatArtSend: () => {
    sendGAEvent("event", EventKeys.ChatArtSend);
  },
  ChatArtSendTryNow: () => {
    sendGAEvent("event", EventKeys.ChatArtSendTryNow);
  },
  ChatArtSuccessful: () => {
    sendGAEvent("event", EventKeys.ChatArtSuccessful);
  },
  ChatArtFail: () => {
    sendGAEvent("event", EventKeys.ChatArtFail);
  },
  ChatArtRegenerate: () => {
    sendGAEvent("event", EventKeys.ChatArtRegenerate);
  },
  ChatArtDownload: () => {
    sendGAEvent("event", EventKeys.ChatArtDownload);
  },
  ChatArtFreeUserTry: () => {
    sendGAEvent("event", EventKeys.ChatArtFreeUserTry);
  },
  ChatArtHitLimit: () => {
    sendGAEvent("event", EventKeys.ChatArtHitLimit);
  },
  // Web Search
  ChatWebSearchUsage: () => {
    sendGAEvent("event", EventKeys.ChatWebSearchUsage);
  },
  ChatWebSearchSend: () => {
    sendGAEvent("event", EventKeys.ChatWebSearchSend);
  },
  ChatWebSearchSuccessful: () => {
    sendGAEvent("event", EventKeys.ChatWebSearchSuccessful);
  },
  ChatWebSearchFail: () => {
    sendGAEvent("event", EventKeys.ChatWebSearchFail);
  },
  ChatWebSearchRegenerate: () => {
    sendGAEvent("event", EventKeys.ChatWebSearchRegenerate);
  },
  ChatWebSearchCopy: () => {
    sendGAEvent("event", EventKeys.ChatWebSearchCopy);
  },
  ChatWebSearchSourceView: () => {
    sendGAEvent("event", EventKeys.ChatWebSearchSourceView);
  },
  ChatWebSearchFreeUserTry: () => {
    sendGAEvent("event", EventKeys.ChatWebSearchFreeUserTry);
  },
  ChatWebSearchHitLimit: () => {
    sendGAEvent("event", EventKeys.ChatWebSearchHitLimit);
  },
  ChatArtEditClick: () => {
    sendGAEvent("event", EventKeys.ChatArtEditClick);
  },
  ChatArtEditSend: () => {
    sendGAEvent("event", EventKeys.ChatArtEditSend);
  },
  ChatArtEditSuccessfully: () => {
    sendGAEvent("event", EventKeys.ChatArtEditSuccessfully);
  },

  // AB Test
  LeftSidebarDownloadButtonLabel: (userId: string, buttonLabel: string) => {
    sendGAEvent("event", EventKeys.LeftSidebarDownloadButtonLabel, {
      button_label: buttonLabel,
      vulcan_user_id: userId,
    });
  },
};
