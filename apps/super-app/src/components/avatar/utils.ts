import type { TStringAvatar } from "./types";

const stringAvatar: TStringAvatar = (value, num = 2) => {
  const splitContent = value.split(" ");
  return splitContent.reduce((prev, cur) => prev + cur[0], "").slice(0, num);
};

export { stringAvatar };
