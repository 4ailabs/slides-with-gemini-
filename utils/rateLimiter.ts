interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  private getKey(identifier: string): string {
    return identifier;
  }

  private cleanOldRequests(key: string, windowMs: number): void {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter((time) => now - time < windowMs);
    this.requests.set(key, validRequests);
  }

  canMakeRequest(identifier: string, options: RateLimitOptions): boolean {
    const key = this.getKey(identifier);
    this.cleanOldRequests(key, options.windowMs);

    const requests = this.requests.get(key) || [];
    return requests.length < options.maxRequests;
  }

  recordRequest(identifier: string): void {
    const key = this.getKey(identifier);
    const requests = this.requests.get(key) || [];
    requests.push(Date.now());
    this.requests.set(key, requests);
  }

  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(this.getKey(identifier));
    } else {
      this.requests.clear();
    }
  }

  getRemainingRequests(identifier: string, options: RateLimitOptions): number {
    const key = this.getKey(identifier);
    this.cleanOldRequests(key, options.windowMs);
    const requests = this.requests.get(key) || [];
    return Math.max(0, options.maxRequests - requests.length);
  }
}

// Instancia global para rate limiting de API
export const apiRateLimiter = new RateLimiter();

// Configuración por defecto: 10 requests por minuto
export const DEFAULT_RATE_LIMIT: RateLimitOptions = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minuto
};

export function checkRateLimit(identifier: string = 'api', options: RateLimitOptions = DEFAULT_RATE_LIMIT): boolean {
  return apiRateLimiter.canMakeRequest(identifier, options);
}

export function recordApiRequest(identifier: string = 'api'): void {
  apiRateLimiter.recordRequest(identifier);
}

export function getRemainingRequests(identifier: string = 'api', options: RateLimitOptions = DEFAULT_RATE_LIMIT): number {
  return apiRateLimiter.getRemainingRequests(identifier, options);
}

