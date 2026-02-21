import { describe, it, expect } from "vitest";
import { exportToMarkdown, exportToJson } from "@/features/export-chat/exportChat";
import type { ChatSession } from "@/entities/message/model";

const mockSession: ChatSession = {
  id: "s1",
  title: "Test Chat",
  createdAt: 1700000000000,
  messages: [
    { id: "m1", role: "user", content: "Hello", timestamp: 1700000001000 },
    { id: "m2", role: "assistant", content: "Hi there!", timestamp: 1700000002000 },
  ],
};

describe("exportToMarkdown", () => {
  it("generates markdown with title and messages", () => {
    const md = exportToMarkdown(mockSession);
    expect(md).toContain("# Test Chat");
    expect(md).toContain("**You**");
    expect(md).toContain("Hello");
    expect(md).toContain("**AI**");
    expect(md).toContain("Hi there!");
  });
});

describe("exportToJson", () => {
  it("generates valid JSON", () => {
    const json = exportToJson(mockSession);
    const parsed = JSON.parse(json);
    expect(parsed.id).toBe("s1");
    expect(parsed.messages).toHaveLength(2);
  });
});
