export interface TLazyInViewProps {
  children: React.ReactNode;
  /** CSS rootMargin for IntersectionObserver (default: '200px') */
  rootMargin?: string;
  /** threshold for IntersectionObserver */
  threshold?: number | number[];
  /** Render placeholder while off-screen */
  placeholder?: React.ReactNode;
  /** If true, once element becomes visible it won't be unmounted again (default: true) */
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
