import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageInput } from "@/widgets/message-input/MessageInput";

vi.mock("@/shared/store/chatStore", () => ({
  useChatStore: vi.fn((selector) => {
    const state = { isStreaming: false };
    return selector(state);
  }),
}));

vi.mock("@/features/send-message/sendMessage", () => ({
  sendMessage: vi.fn(),
  abortCurrentStream: vi.fn(),
}));

describe("MessageInput", () => {
  it("renders input and send button", () => {
    render(<MessageInput />);
    expect(screen.getByPlaceholderText("무엇이든 물어보세요...")).toBeDefined();
    expect(screen.getByLabelText("메시지 전송")).toBeDefined();
  });

  it("has correct aria labels", () => {
    render(<MessageInput />);
    expect(screen.getByLabelText("메시지 입력")).toBeDefined();
    expect(screen.getByLabelText("메시지 전송")).toBeDefined();
  });

  it("disables send when empty", () => {
    render(<MessageInput />);
    const btn = screen.getByLabelText("메시지 전송");
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  it("enables send when text entered", () => {
    render(<MessageInput />);
    const input = screen.getByPlaceholderText("무엇이든 물어보세요...");
    fireEvent.change(input, { target: { value: "Hello" } });
    const btn = screen.getByLabelText("메시지 전송");
    expect(btn.hasAttribute("disabled")).toBe(false);
  });
});
