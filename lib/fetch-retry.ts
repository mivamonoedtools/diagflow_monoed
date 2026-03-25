export type FetchRetryOptions = {
  /** Extra attempts after the first (default 2 → 3 tries total). */
  retries?: number;
  baseDelayMs?: number;
};

/**
 * Retries on network failure or 5xx. Does not retry most 4xx (except optional 429 later).
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit,
  options?: FetchRetryOptions,
): Promise<Response> {
  const retries = options?.retries ?? 2;
  const baseDelayMs = options?.baseDelayMs ?? 500;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(input, init);
      if (res.ok || res.status < 500) return res;
      lastError = new Error(`Server error ${res.status}`);
    } catch (e) {
      lastError = e;
    }
    if (attempt < retries) {
      await new Promise((r) =>
        setTimeout(r, baseDelayMs * (attempt + 1)),
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Request failed after retries");
}
