# Overlay Stacking Policy

This project uses a centralized z-index manager to avoid modal and popup stacking conflicts.

## Rules

- Use `ModalV2` for blocking dialogs.
- Do not hardcode extreme z-index values (for example `z-[9999]`, `z-[99999]`, `z-[100000]`).
- Do not override `zIndex` via `dialogContentProps.style` in `ModalV2` consumers.
- Let newer overlays stack above older overlays through `useZIndex`.

## Managed ranges

- Tooltip/Dropdown: `1000-1099`
- Context menu/Popover: `1100-1199`
- Modal normal: `1200-1999`
- Modal high: `2000-2999`
- Modal critical: `3000-3999`

## Semantic tokens

Use tokens from `src/internal/configs/zIndex.ts`:

- `OVERLAY_Z_INDEX.MODAL_BASE`
- `OVERLAY_Z_INDEX.MODAL_FLOW`
- `OVERLAY_Z_INDEX.MODAL_SUBSCRIPTION`
- `OVERLAY_Z_INDEX.MODAL_CRITICAL`

Legacy constants under `MODAL_Z_INDEX` remain for compatibility, but new code should prefer semantic tokens.

## Queue integration

The onboarding popup queue pauses while any blocking overlay is open (`isAnyBlockingOverlayOpen`) and resumes when all blocking overlays are closed.

## Guardrail script

Run:

`pnpm check:overlay-zindex`

It fails on:

- Tailwind classes `z-[9999]`, `z-[99999]`, `z-[100000]`
- Inline `zIndex` values above managed ranges (`> 3999`)
