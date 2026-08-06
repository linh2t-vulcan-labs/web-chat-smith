interface BuildManifest {
  generatedAt: string;
  tokenCount: number;
  version: string;
}

export const generateManifest = (
  version: string,
  tokenCount: number,
  generatedAt = new Date().toISOString()
): BuildManifest => ({
  generatedAt,
  tokenCount,
  version,
});
