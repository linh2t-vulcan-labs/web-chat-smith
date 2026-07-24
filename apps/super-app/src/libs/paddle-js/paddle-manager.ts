/**
 * Paddle Manager Singleton
 * Provides centralized access to Paddle checkout operations
 * Designed for Next.js with SSR compatibility and high scalability
 */

type PaddleCloseFunction = () => void;

class PaddleManager {
  private static instance: PaddleManager;
  private closeCheckoutFn: PaddleCloseFunction | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PaddleManager {
    if (!PaddleManager.instance) {
      PaddleManager.instance = new PaddleManager();
    }
    return PaddleManager.instance;
  }

  /**
   * Register Paddle close function
   * Called by the component that initializes Paddle
   */
  public registerCloseFunction(closeFn: PaddleCloseFunction | null): void {
    this.closeCheckoutFn = closeFn;
  }

  /**
   * Close Paddle checkout if it's open
   * Safe to call even if Paddle isn't initialized
   */
  public closeCheckout(): void {
    if (this.closeCheckoutFn) {
      try {
        this.closeCheckoutFn();
      } catch (error) {
        console.error("Failed to close Paddle checkout:", error);
      }
    }
  }

  /**
   * Check if Paddle close function is available
   */
  public isAvailable(): boolean {
    return this.closeCheckoutFn !== null;
  }

  /**
   * Clear the close function (useful for cleanup)
   */
  public clear(): void {
    this.closeCheckoutFn = null;
  }
}

// Export singleton instance
export const paddleManager = PaddleManager.getInstance();

// Export for testing purposes
export { PaddleManager };
