import { useState, useRef, useEffect } from "react";
import { sendMessage, abortCurrentStream } from "@/features/send-message/sendMessage";
import { useChatStore } from "@/shared/store/chatStore";
import { Send, Square } from "lucide-react";

export function MessageInput() {
  const [text, setText] = useState("");
  const isStreaming = useChatStore((s) => s.isStreaming);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleSend = async () => {
    if (isStreaming) {
      abortCurrentStream();
      return;
    }
    if (!text.trim()) return;
    const msg = text;
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  return (
    <div className="px-6 pb-6 pt-4 bg-bg-primary">
      <div className="max-w-3xl mx-auto relative">
        <div className="flex items-end bg-bg-input border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow focus-within:border-accent focus-within:shadow-md">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask anything..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            className="flex-1 py-3.5 pl-5 pr-2 bg-transparent border-none text-text-primary text-sm font-inherit resize-none outline-none min-h-[44px] max-h-[160px] leading-relaxed placeholder:text-text-muted"
            aria-label="Message input"
          />
          <button
            onClick={handleSend}
            className={`m-2 p-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer border-none ${
              isStreaming
                ? "bg-danger hover:bg-danger-hover text-white"
                : text.trim()
                ? "bg-accent hover:bg-accent-hover text-white"
                : "bg-bg-tertiary text-text-muted"
            }`}
            disabled={!isStreaming && !text.trim()}
            aria-label={isStreaming ? "Stop streaming" : "Send message"}
          >
            {isStreaming ? <Square size={16} /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[11px] text-text-muted text-center mt-2">
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
