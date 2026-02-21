import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageItem } from "@/widgets/chat-window/MessageItem";
import type { Message } from "@/entities/message/model";

const userMessage: Message = {
  id: "u1",
  role: "user",
  content: "Hello world",
  timestamp: Date.now(),
};

const assistantMessage: Message = {
  id: "a1",
  role: "assistant",
  content: "Hi there! How can I help?",
  timestamp: Date.now(),
};

const messageWithSources: Message = {
  id: "a2",
  role: "assistant",
  content: "Here are the results",
  timestamp: Date.now(),
  sources: [
    { url: "https://example.com", title: "Example", domain: "example.com", snippet: "An example." },
  ],
  relatedQuestions: [{ text: "What about X?" }],
};

describe("MessageItem", () => {
  it("renders user message", () => {
    render(
      <MessageItem message={userMessage} isLast={false} isStreaming={false} />
    );
    expect(screen.getByText("Hello world")).toBeDefined();
    // User message rendered as bubble without label
  });

  it("renders assistant message with markdown", () => {
    render(
      <MessageItem message={assistantMessage} isLast={false} isStreaming={false} />
    );
    expect(screen.getByText("CardNews AI")).toBeDefined();
  });

  it("shows streaming cursor when streaming", () => {
    render(
      <MessageItem message={assistantMessage} isLast={true} isStreaming={true} />
    );
    // Cursor element should be present
    const container = screen.getByText("CardNews AI").closest("div")!.parentElement!;
    expect(container.querySelector(".animate-\\[blink_0\\.8s_infinite\\]")).toBeDefined();
  });

  it("calls onDelete when delete button clicked", async () => {
    const onDelete = vi.fn();
    render(
      <MessageItem
        message={userMessage}
        isLast={false}
        isStreaming={false}
        onDelete={onDelete}
      />
    );
    const deleteBtn = screen.getByLabelText("메시지 삭제");
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith("u1");
  });
});
