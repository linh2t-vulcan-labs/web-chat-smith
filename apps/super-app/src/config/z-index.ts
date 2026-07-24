/**
 * Z-Index Constants
 *
 * Base z-index values for backward compatibility.
 * For new components, use the z-index manager (useZIndex hook) instead.
 *
 * Z-Index Ranges (managed by z-index-manager):
 * - Tooltips/Dropdowns: 1000-1099
 * - Context Menus/Popovers: 1100-1199
 * - Modals (normal): 1200-1999
 * - Modals (high priority): 2000-2999
 * - Modals (critical): 3000-3999
 */

// Semantic base z-index tokens for managed overlays
export const OVERLAY_Z_INDEX = {
  MODAL_BASE: 1200,
  MODAL_FLOW: 1600,
  // High-priority subscription modals should overlay account/settings flows
  MODAL_SUBSCRIPTION: 2200,
  MODAL_CRITICAL: 3200,
} as const;

// Legacy constants for backward compatibility
export const MODAL_Z_INDEX = {
  BASE: OVERLAY_Z_INDEX.MODAL_BASE,
  GUEST_LOGIN_MODAL: OVERLAY_Z_INDEX.MODAL_FLOW,
  MANAGE_ACCOUNT: OVERLAY_Z_INDEX.MODAL_FLOW + 1,
  SUBSCRIPTION: OVERLAY_Z_INDEX.MODAL_SUBSCRIPTION,
} as const;

// Z-index ranges used by the z-index manager
export const Z_INDEX_RANGES = {
  CONTEXT_MENU: { max: 1199, min: 1100 },
  DROPDOWN: { max: 1099, min: 1000 },
  MODAL_CRITICAL: { max: 3999, min: 3000 },
  MODAL_HIGH: { max: 2999, min: 2000 },
  MODAL_NORMAL: { max: 1999, min: 1200 },
  POPOVER: { max: 1199, min: 1100 },
  TOOLTIP: { max: 1099, min: 1000 },
} as const;
