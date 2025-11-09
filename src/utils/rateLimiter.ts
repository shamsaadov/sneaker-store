// Simple client-side rate limiter to prevent too many requests
class RateLimiter {
  private requestTimestamps: Map<string, number[]> = new Map();
  private maxRequests: number;
  private timeWindow: number; // in milliseconds

  constructor(maxRequests: number = 10, timeWindowSeconds: number = 1) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowSeconds * 1000;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(key) || [];

    // Remove timestamps outside the time window
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.timeWindow
    );

    if (recentTimestamps.length >= this.maxRequests) {
      return false;
    }

    recentTimestamps.push(now);
    this.requestTimestamps.set(key, recentTimestamps);

    return true;
  }

  async waitForSlot(key: string): Promise<void> {
    while (!this.canMakeRequest(key)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  reset(key: string): void {
    this.requestTimestamps.delete(key);
  }

  resetAll(): void {
    this.requestTimestamps.clear();
  }
}

// Global rate limiter: max 30 requests per 10 seconds
export const globalRateLimiter = new RateLimiter(30, 10);

