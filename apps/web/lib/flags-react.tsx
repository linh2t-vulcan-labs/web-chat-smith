"use client";

import { createFlagsReact } from "@cs/flags/react";

import type { flagSchema } from "@/lib/flags";

/**
 * Split out of `lib/flags.ts` because `createFlagsReact()` calls
 * `createContext` at module scope — that's only valid in a module Next.js
 * knows is client-only. `lib/flags.ts` itself has to stay import-safe from
 * Server Components (e.g. `[locale]/(workspace)/layout.tsx` reads
 * `flagSchema`/needs `Feature`), so the "use client" boundary — and the
 * `createFlagsReact()` call it gates — lives here instead. Importing
 * `Feature`/`FlagsProvider` from *this* file into a Server Component is fine
 * (that's the standard Server Component renders Client Component pattern);
 * importing them from an un-annotated module that itself calls
 * `createFlagsReact()` is what throws "Attempted to call ... from the server".
 */
export const { FlagsProvider, Feature, useFlag } =
  createFlagsReact<typeof flagSchema>();
