import path from "node:path";

import { $ } from "bun";

import { styleText } from "../lib/utils/console-colors";

const { resolve } = path;

const GENERATED_ROOT = resolve(import.meta.dir, "../../generated-token");

export const run = async (): Promise<void> => {
  await $`rm -rf ${GENERATED_ROOT} && mkdir -p ${GENERATED_ROOT}`.quiet();
  console.log(styleText("green", `Cleaned: ${GENERATED_ROOT}`));
  console.log(
    styleText(
      "cyan",
      "Run `bun run tokens build --all` to regenerate every version."
    )
  );
};
