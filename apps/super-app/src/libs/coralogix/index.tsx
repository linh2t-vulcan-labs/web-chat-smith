"use client";

import { CoralogixRum } from "@coralogix/browser";
import { getPublicEnv } from "@cs/env/client";
import { useEffect } from "react";

// import useLocalStorage from "@/hooks/use-local-storage";
import { isServer } from "@/utils/commons/helpers";
// import { USER_ID_KEY } from "@/utils/commons/keys";

import { createColoragixEnvs } from "./configs";

const CORALOGIX_LABELS = {
  AUTHEN_REQUEST: "authen_request",
  ERROR_LOCALE_LAYOUT: "error_locale_layout",
  ERROR_MAIN_PAGE_LAYOUT: "error_main_page_layout",
  ERROR_SOURCE: "error_source",
  FETCH_REQUEST: "fetch_request",
  GLOBAL_ERROR_PAGE: "global_error_page",
};

const initializeCoralogixRUM = () => {
  if (!isServer && !CoralogixRum.isInited) {
    CoralogixRum.init(createColoragixEnvs());
  }
};

export default function CoralogixProvider() {
  useEffect(() => {
    if (getPublicEnv().CS_PUBLIC_ENV_NAME === "production") {
      initializeCoralogixRUM();
    }
  }, []);

  return null;
}

export { CORALOGIX_LABELS };
