interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, shouldRetry = defaultShouldRetry } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

function defaultShouldRetry(error: unknown): boolean {
  if (error instanceof Response) {
    return error.status >= 500;
  }
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }
  return false;
}
