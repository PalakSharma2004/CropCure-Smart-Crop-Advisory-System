// API utility functions for error handling, retries, and fallbacks

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  shouldRetry: (error, attempt) => {
    // Don't retry on client errors (4xx) except rate limiting
    if (error.message.includes("429")) return true;
    if (error.message.includes("4")) return false;
    return attempt < 3;
  },
};

// Exponential backoff with jitter
export function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, maxDelay);
}

// Generic retry wrapper
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= opts.maxRetries!; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === opts.maxRetries || !opts.shouldRetry!(lastError, attempt)) {
        throw lastError;
      }

      const delay = calculateBackoff(attempt, opts.baseDelay!, opts.maxDelay!);
      await sleep(delay);
    }
  }

  throw lastError;
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check network connectivity
export function isOnline(): boolean {
  return navigator.onLine;
}

// Network status listener
export function onNetworkChange(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
}

// Timeout wrapper
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Request timed out"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

// Graceful degradation helper
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => T | Promise<T>,
  onFallback?: (error: Error) => void
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    if (onFallback) {
      onFallback(error instanceof Error ? error : new Error(String(error)));
    }
    return await fallback();
  }
}

// Debounce function for search/input
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle function for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Parse API error response
export function parseAPIError(error: unknown): { message: string; code?: string; status?: number } {
  if (error instanceof Response) {
    return {
      message: error.statusText || "Request failed",
      status: error.status,
    };
  }

  if (error instanceof Error) {
    // Try to parse JSON error message
    try {
      const parsed = JSON.parse(error.message);
      return {
        message: parsed.error || parsed.message || error.message,
        code: parsed.code,
      };
    } catch {
      return { message: error.message };
    }
  }

  return { message: String(error) };
}

// Create a queue for rate-limited requests
export function createRequestQueue(maxConcurrent: number = 2, delayMs: number = 100) {
  const queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  let activeCount = 0;

  async function processQueue() {
    if (activeCount >= maxConcurrent || queue.length === 0) return;

    activeCount++;
    const { fn, resolve, reject } = queue.shift()!;

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      activeCount--;
      if (queue.length > 0) {
        setTimeout(processQueue, delayMs);
      }
    }
  }

  return function enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      processQueue();
    });
  };
}
