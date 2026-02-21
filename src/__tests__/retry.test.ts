import { describe, it, expect, vi } from "vitest";
import { withRetry } from "@/shared/lib/retry";

describe("withRetry", () => {
  it("returns result on first success", async () => {
    const result = await withRetry(() => Promise.resolve("ok"));
    expect(result).toBe("ok");
  });

  it("retries on failure and succeeds", async () => {
    let attempt = 0;
    const result = await withRetry(
      () => {
        attempt++;
        if (attempt < 3) throw new TypeError("fetch failed");
        return Promise.resolve("ok");
      },
      { baseDelay: 10, shouldRetry: () => true }
    );
    expect(result).toBe("ok");
    expect(attempt).toBe(3);
  });

  it("throws after max retries", async () => {
    await expect(
      withRetry(
        () => {
          throw new Error("always fail");
        },
        { maxRetries: 2, baseDelay: 10, shouldRetry: () => true }
      )
    ).rejects.toThrow("always fail");
  });

  it("does not retry when shouldRetry returns false", async () => {
    let attempt = 0;
    await expect(
      withRetry(
        () => {
          attempt++;
          throw new Error("no retry");
        },
        { baseDelay: 10, shouldRetry: () => false }
      )
    ).rejects.toThrow("no retry");
    expect(attempt).toBe(1);
  });
});
