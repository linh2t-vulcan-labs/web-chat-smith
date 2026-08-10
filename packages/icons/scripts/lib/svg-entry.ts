import path from "node:path";

import type { Entry } from "./icon-importer";
import { parseSvg } from "./svg";

export interface ParsedEntry {
  ok: true;
  viewBox: string;
  children: string;
}
export interface UnparsedEntry {
  ok: false;
  message: string;
}

/** Reads and parses one dump entry's SVG source. Shared by `generate-icons.ts`
 * (which needs the parsed `viewBox`/`children` to emit a component) and the
 * preview gallery (which only needs to know whether parsing would succeed,
 * so a shape's actual generatability shows up before `bun run gen` runs). */
export const tryParseEntry = async (
  dumpDir: string,
  entry: Entry
): Promise<ParsedEntry | UnparsedEntry> => {
  const source = await Bun.file(path.join(dumpDir, entry.relPath)).text();
  try {
    const { viewBox, children } = parseSvg(source, entry.relPath);
    return { children, ok: true, viewBox };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { message, ok: false };
  }
};
