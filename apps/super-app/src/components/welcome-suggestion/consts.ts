export const LIMIT_IMAGE_ITEMS = 2;
export const LIMIT_ICON_ITEMS = 3;

// Animation constants
export const SUGGESTION_ANIMATION = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 20 },
  staggerDelay: 0.1,
  transition: {
    duration: 0.6,
    ease: "easeOut",
  },
  whileTap: { scale: 0.98 },
} as const;
