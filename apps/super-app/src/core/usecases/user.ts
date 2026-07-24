export interface TUserUseCases {
  checkIsNewUser: (createdAt: string, thresholdDays: number) => boolean;
}

const checkIsNewUser: TUserUseCases["checkIsNewUser"] = (
  createdAt,
  thresholdDays
) => {
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) {
    return false;
  }

  const now = Date.now();
  const thresholdDayMs = thresholdDays * 24 * 60 * 60 * 1000;

  return now - createdTime <= thresholdDayMs;
};

export const userUseCases = (): TUserUseCases => ({
  checkIsNewUser,
});
