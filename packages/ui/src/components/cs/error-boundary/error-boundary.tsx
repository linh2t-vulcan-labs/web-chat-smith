"use client";

// Error boundaries must be class components — no hooks-based alternative exists in React 19.
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

export interface ErrorBoundaryProps {
  /**
   * Shown when an error is caught. Accepts a static node or a render function
   * that receives the caught error and a `reset` callback to clear the error state.
   */
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Called after an error is caught, useful for logging to an error reporter. */
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset = () => {
    // oxlint-disable-next-line react/no-set-state -- error boundary needs to update its own state to recover/reset after the caught error is cleared
    this.setState({ error: null });
  };

  render() {
    const { children, fallback } = this.props;
    const { error } = this.state;

    if (error) {
      return typeof fallback === "function"
        ? fallback(error, this.reset)
        : fallback;
    }

    return children;
  }
}

/**
 * Wrap a component tree with an error boundary.
 *
 * @example
 * const SafeWidget = withErrorBoundary(Widget, {
 *   fallback: (error, reset) => (
 *     <button onClick={reset}>Retry: {error.message}</button>
 *   ),
 * });
 */
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  boundaryProps: Omit<ErrorBoundaryProps, "children">
): React.ComponentType<P> => {
  const displayName =
    WrappedComponent.displayName ?? WrappedComponent.name ?? "Component";

  const WithErrorBoundary = (props: P) => (
    <ErrorBoundary {...boundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return WithErrorBoundary;
};
