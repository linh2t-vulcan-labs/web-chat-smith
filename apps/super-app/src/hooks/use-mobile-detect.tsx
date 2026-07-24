import { isServer } from "@/utils/commons/helpers";

interface MobileDetect {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isAndroid: boolean;
  isIos: boolean;
  isSSR: boolean;
  os: "Android" | "iOS" | "desktop";
}

export const getMobileDetect = (userAgent: string): MobileDetect => {
  const isAndroid = Boolean(/Android/iu.test(userAgent));
  // Check if the device is an iPad running iOS 13+ with touch support
  const isIPad13 = Boolean(/Mac/iu.test(userAgent)) && "ontouchend" in document;
  const isIos = Boolean(/iPhone|iPad|iPod/iu.test(userAgent)) || isIPad13;
  const isOpera = Boolean(/Opera Mini/iu.test(userAgent));
  const isWindows = Boolean(/IEMobile/iu.test(userAgent));
  const isSSR = Boolean(/SSR/iu.test(userAgent));

  const isMobile =
    Boolean(/Android|iPhone|iPod|BlackBerry/iu.test(userAgent)) ||
    isOpera ||
    isWindows;
  const isTablet =
    !isMobile &&
    (Boolean(/iPad|Android(?!.*Mobile)|Tablet|Kindle/iu.test(userAgent)) ||
      isIPad13);
  const isDesktop = !isTablet && !isMobile && !isSSR;

  const osDetect = () => {
    if (isAndroid) {
      return "Android";
    }

    if (isIos) {
      return "iOS";
    }

    return "desktop";
  };

  const os = osDetect();

  return {
    isAndroid,
    isDesktop,
    isIos,
    isMobile,
    isSSR,
    isTablet,
    os,
  };
};

const useMobileDetect = (): MobileDetect => {
  const userAgent = isServer ? "SSR" : navigator.userAgent;
  return getMobileDetect(userAgent);
};

export default useMobileDetect;
