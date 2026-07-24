/**
 * Subscription Polling Manager
 *
 * Singleton pattern to ensure only one subscription polling instance runs at a time.
 * Prevents race conditions when multiple components try to poll simultaneously.
 *
 * SOLID Principles:
 * - Single Responsibility: Only manages subscription polling state
 * - Open/Closed: Easy to extend with new polling strategies
 * - Liskov Substitution: Can be replaced with different implementations
 * - Interface Segregation: Clean, focused interface
 * - Dependency Inversion: Depends on abstractions, not concretions
 *
 * KISS: Simple, clear interface
 * DRY: Centralized logic, no duplication
 */

interface PollingCallbacks {
  onSuccess?: () => void;
  onError?: () => void;
}

type StateChangeListener = () => void;

interface PollingState {
  isActive: boolean;
  isLoading: boolean;
  pollingInterval: NodeJS.Timeout | null;
  timeout: NodeJS.Timeout | null;
  callbacks: PollingCallbacks[];
  startTime: Date | null;
}

class SubscriptionPollingManager {
  private static instance: SubscriptionPollingManager;
  private readonly state: PollingState = {
    callbacks: [],
    isActive: false,
    isLoading: false,
    pollingInterval: null,
    startTime: null,
    timeout: null,
  };

  private readonly listeners = new Set<StateChangeListener>();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SubscriptionPollingManager {
    if (!SubscriptionPollingManager.instance) {
      SubscriptionPollingManager.instance = new SubscriptionPollingManager();
    }
    return SubscriptionPollingManager.instance;
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (error) {
        console.error("Error notifying polling state listener:", error);
      }
    }
  }

  /**
   * Check if polling is currently active
   */
  public isPollingActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Get the current loading state
   */
  public getIsLoading(): boolean {
    return this.state.isLoading;
  }

  /**
   * Set the loading state
   */
  public setIsLoading(loading: boolean): void {
    if (this.state.isLoading !== loading) {
      this.state.isLoading = loading;
      this.notifyListeners();
    }
  }

  /**
   * Register callbacks for polling completion
   * Returns true if polling was started, false if already active
   */
  public registerCallbacks(callbacks: PollingCallbacks): boolean {
    // If polling is already active, just add callbacks to the queue
    if (this.state.isActive) {
      this.state.callbacks.push(callbacks);
      this.setIsLoading(true); // Ensure loading is true when adding to active polling
      return false;
    }

    // Start new polling session
    this.state.callbacks = [callbacks];
    this.state.isActive = true;
    this.setIsLoading(true);
    this.state.startTime = new Date();
    return true;
  }

  /**
   * Set the polling interval reference
   */
  public setPollingInterval(interval: NodeJS.Timeout | null): void {
    this.state.pollingInterval = interval;
  }

  /**
   * Set the timeout reference
   */
  public setTimeout(timeout: NodeJS.Timeout | null): void {
    this.state.timeout = timeout;
  }

  /**
   * Get the start time of current polling session
   */
  public getStartTime(): Date | null {
    return this.state.startTime;
  }

  /**
   * Clear all polling timers and reset state
   */
  public clearPolling(): void {
    if (this.state.pollingInterval) {
      clearInterval(this.state.pollingInterval);
      this.state.pollingInterval = null;
    }

    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
      this.state.timeout = null;
    }

    this.state.isActive = false;
    this.setIsLoading(false);
    this.state.startTime = null;
    // Keep callbacks for potential retry scenarios, but mark as inactive
  }

  /**
   * Execute all success callbacks
   * Note: Does not clear polling - call clearPolling() separately if needed
   */
  public executeSuccessCallbacks(): void {
    const callbacks = [...this.state.callbacks]; // Copy to avoid issues if callbacks modify state
    for (const cb of callbacks) {
      try {
        cb.onSuccess?.();
      } catch (error) {
        console.error("Error executing polling success callback:", error);
      }
    }
  }

  /**
   * Execute all error callbacks
   * Note: Does not clear polling - call clearPolling() separately if needed
   */
  public executeErrorCallbacks(): void {
    const callbacks = [...this.state.callbacks]; // Copy to avoid issues if callbacks modify state
    for (const cb of callbacks) {
      try {
        cb.onError?.();
      } catch (error) {
        console.error("Error executing polling error callback:", error);
      }
    }
  }

  /**
   * Reset the manager (useful for testing or cleanup)
   */
  public reset(): void {
    this.clearPolling();
    this.state.callbacks = [];
    this.setIsLoading(false);
  }
}

// Export singleton instance
export const subscriptionPollingManager =
  SubscriptionPollingManager.getInstance();

// Export for testing purposes
export { SubscriptionPollingManager };
