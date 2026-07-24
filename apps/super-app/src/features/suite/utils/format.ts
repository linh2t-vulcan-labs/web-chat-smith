export const formatElapsed = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;

  return `${m}:${String(s).padStart(2, "0")}`;
};

export const formatTotal = (ms: number) => {
  const totalSec = Math.floor(ms / 1000);

  if (totalSec >= 60) {
    return `${Math.round(totalSec / 60)}m`;
  }

  return `${totalSec}s`;
};
