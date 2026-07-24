import type { SuiteImageDownloadFormat } from "@/features/suite/types/download-image";

export const downloadImageFromUrl = async (
  src: string,
  format: SuiteImageDownloadFormat
) => {
  const img = new window.Image();

  await new Promise<void>((resolve, reject) => {
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", reject, { once: true });
    img.crossOrigin = "anonymous";
    img.src = src;
  });

  const cv = document.createElement("canvas");
  cv.width = img.naturalWidth;
  cv.height = img.naturalHeight;

  const ctx = cv.getContext("2d");

  if (!ctx) {
    return;
  }

  if (format === "jpg") {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cv.width, cv.height);
  }

  ctx.drawImage(img, 0, 0);

  const mimeType = format === "jpg" ? "image/jpeg" : "image/png";

  cv.toBlob((blob) => {
    if (!blob) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `image.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, mimeType);
};
