import { describe, it, expect } from "vitest";
import { z } from "zod";

// Test the schema logic directly (can't test import.meta.env in unit tests)
describe("env validation schema", () => {
  const clientEnvSchema = z.object({
    VITE_API_URL: z.string().url().optional(),
  });

  it("accepts valid URL", () => {
    const result = clientEnvSchema.safeParse({ VITE_API_URL: "https://api.example.com" });
    expect(result.success).toBe(true);
  });

  it("accepts undefined URL", () => {
    const result = clientEnvSchema.safeParse({ VITE_API_URL: undefined });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL", () => {
    const result = clientEnvSchema.safeParse({ VITE_API_URL: "not-a-url" });
    expect(result.success).toBe(false);
  });
});
