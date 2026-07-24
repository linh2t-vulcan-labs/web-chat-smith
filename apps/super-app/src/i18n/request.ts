import { createRequestConfig } from "@cs/i18n/request";
import type { AppMessageLoader } from "@cs/i18n/request";

import { routing } from "./routing";

const loadMessages: AppMessageLoader = async (locale) => {
  const [
    assistantWriting,
    common,
    landingPage,
    ds,
    loginPage,
    mainLayout,
    conversationPage,
    remoteConfig,
    myPlan,
    faqPage,
    aiTool,
    pricing,
    createStudio,
  ] = await Promise.all([
    import(`./locale/${locale}/assistant_writing.json`).then((m) => m.default),
    import(`./locale/${locale}/common.json`).then((m) => m.default),
    import(`./locale/${locale}/landing_page.json`).then((m) => m.default),
    import(`./locale/${locale}/ds.json`).then((m) => m.default),
    import(`./locale/${locale}/login_page.json`).then((m) => m.default),
    import(`./locale/${locale}/main_layout.json`).then((m) => m.default),
    import(`./locale/${locale}/conversation_page.json`).then((m) => m.default),
    import(`./locale/${locale}/remote_config.json`).then((m) => m.default),
    import(`./locale/${locale}/my_plan.json`).then((m) => m.default),
    import(`./locale/${locale}/faq_page.json`).then((m) => m.default),
    import(`./locale/${locale}/ai_tool.json`).then((m) => m.default),
    import(`./locale/${locale}/pricing.json`).then((m) => m.default),
    import(`./locale/${locale}/create_studio.json`).then((m) => m.default),
  ]);

  return {
    aiTool,
    assistantWriting,
    common,
    conversationPage,
    createStudio,
    ds,
    faqPage,
    landingPage,
    loginPage,
    mainLayout,
    myPlan,
    pricing,
    remoteConfig,
  };
};

export default createRequestConfig(loadMessages, routing);
