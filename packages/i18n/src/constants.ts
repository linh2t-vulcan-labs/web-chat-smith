/**
 * 1. Nguồn dữ liệu gốc duy nhất (Single Source of Truth).
 * Khóa chặt bằng `as const` để TypeScript biết chính xác từng giá trị text bên trong.
 */
export const SUPPORTED_LOCALES = [
  {
    direction: "ltr",
    label: "English (US)",
    value: "en",
  },
  {
    direction: "ltr",
    label: "Chinese (简体)",
    value: "zh-Hans",
  },
  {
    direction: "ltr",
    label: "Thai (ไทย)",
    value: "th",
  },
  {
    direction: "rtl",
    label: "Arabic (العربية)",
    value: "ar",
  },
  {
    direction: "ltr",
    label: "Spanish (Español)",
    value: "es",
  },
  {
    direction: "ltr",
    label: "Korean (한국어)",
    value: "ko",
  },
  {
    direction: "ltr",
    label: "Japanese (日本語)",
    value: "ja",
  },
  {
    direction: "rtl",
    label: "Hindi (हिंदी)",
    value: "hi",
  },
] as const;

/**
 * 2. Tự động suy luận kiểu dữ liệu Strict Union từ mảng gốc.
 * Kết quả: 'vi' | 'en-US' | 'ar-EG'
 */
export type Locale = (typeof SUPPORTED_LOCALES)[number]["value"];

/**
 * 3. Trích xuất danh sách mã locale dạng mảng string thuần túy phục vụ Next.js Middleware.
 * Sử dụng `as Locale[]` để giữ định dạng strict type.
 */
export const LOCALE_CODES = SUPPORTED_LOCALES.map(
  (item) => item.value
) as Locale[];

/**
 * 4. Locale mặc định của hệ thống
 */
export const DEFAULT_LOCALE: Locale = "en";

export const COOKIE_NAME_LOCALE = "vul-locale" as const;
