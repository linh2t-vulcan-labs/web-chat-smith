const HEX_COLOR_REGEX = /^#(?<hex>[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/iu;

export const isHexColor = (value: string): boolean =>
  HEX_COLOR_REGEX.test(value);

export const normalizeHexColor = (value: string): string => {
  const lower = value.toLowerCase();
  const hex = lower.slice(1);

  if (hex.length !== 3 && hex.length !== 4) {
    return lower;
  }

  const expanded = [...hex].map((channel) => `${channel}${channel}`).join("");
  return `#${expanded}`;
};

/** Normalizes a value to a canonical hex color if it is one, otherwise passes it through. */
export const normalizeColorIfHex = (value: unknown): unknown =>
  typeof value === "string" && isHexColor(value)
    ? normalizeHexColor(value)
    : value;

const hexToRgb = (value: string): [number, number, number] => {
  const hex = normalizeHexColor(value).slice(1);
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return [red, green, blue];
};

const normalizeChannel = (channel: number): number => {
  const srgb = channel / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = (hex: string): number => {
  const [red, green, blue] = hexToRgb(hex);
  const r = normalizeChannel(red);
  const g = normalizeChannel(green);
  const b = normalizeChannel(blue);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const getContrastRatio = (first: string, second: string): number => {
  const l1 = relativeLuminance(first);
  const l2 = relativeLuminance(second);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};
