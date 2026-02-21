import { describe, it, expect } from "vitest";
import { z } from "zod";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  tool_calls: z.array(z.any()).optional(),
  tool_call_id: z.string().optional(),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(200),
  model: z.string().max(50).optional(),
  systemPrompt: z.string().max(10000).optional(),
  tools: z.boolean().optional(),
});

describe("chatRequestSchema", () => {
  it("accepts valid request", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "Hello" }],
      model: "gpt-4o",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty messages", () => {
    const result = chatRequestSchema.safeParse({ messages: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "invalid", content: "Hello" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects model exceeding max length", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "Hello" }],
      model: "x".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects systemPrompt exceeding max length", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "Hello" }],
      systemPrompt: "x".repeat(10001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many messages", () => {
    const messages = Array.from({ length: 201 }, () => ({
      role: "user" as const,
      content: "msg",
    }));
    const result = chatRequestSchema.safeParse({ messages });
    expect(result.success).toBe(false);
  });

  it("accepts tools as boolean", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "Hello" }],
      tools: false,
    });
    expect(result.success).toBe(true);
  });
});
