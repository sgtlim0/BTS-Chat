import { useState, useRef, useEffect } from "react";
import { sendMessage, abortCurrentStream } from "@/features/send-message/sendMessage";
import { useChatStore } from "@/shared/store/chatStore";
import { useSettingsStore, AVAILABLE_MODELS } from "@/shared/store/settingsStore";
import { ArrowUp, Square, ChevronDown } from "lucide-react";

export function MessageInput() {
  const [text, setText] = useState("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const model = useSettingsStore((s) => s.model);
  const setModel = useSettingsStore((s) => s.setModel);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === model) ?? AVAILABLE_MODELS[0];

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  useEffect(() => {
    if (!showModelPicker) return;
    const handleClickOutside = () => setShowModelPicker(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showModelPicker]);

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
    <div className="px-6 pb-5 pt-2 bg-bg-primary">
      <div className="max-w-[720px] mx-auto relative">
        <div className="flex items-end bg-bg-secondary border border-border rounded-2xl transition-all focus-within:border-accent/40 focus-within:shadow-sm">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="무엇이든 물어보세요..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            className="flex-1 py-3 pl-4 pr-2 bg-transparent border-none text-text-primary text-[14px] font-inherit resize-none outline-none min-h-[44px] max-h-[160px] leading-relaxed placeholder:text-text-muted"
            aria-label="메시지 입력"
          />
          <div className="flex items-center gap-1 m-1.5">
            {/* Model Picker */}
            <div className="relative">
              <button
                className="flex items-center gap-1 text-[12px] text-text-secondary bg-transparent border-none cursor-pointer px-2 py-1.5 rounded-lg hover:bg-bg-tertiary transition-colors whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModelPicker((v) => !v);
                }}
                aria-label="모델 선택"
              >
                {currentModel.name}
                <ChevronDown size={12} className="text-text-muted" />
              </button>
              {showModelPicker && (
                <div className="absolute bottom-full right-0 mb-1 bg-bg-primary border border-border rounded-xl p-1.5 min-w-[220px] z-50 shadow-lg">
                  {AVAILABLE_MODELS.map((m) => (
                    <button
                      key={m.id}
                      className={`w-full bg-transparent border-none text-left px-3 py-2 text-[13px] cursor-pointer rounded-lg flex flex-col gap-0.5 transition-colors ${
                        m.id === model
                          ? "bg-accent-light text-accent"
                          : "text-text-primary hover:bg-bg-tertiary"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModel(m.id);
                        setShowModelPicker(false);
                      }}
                    >
                      <span className="font-medium">{m.name}</span>
                      <span className="text-[11px] text-text-muted">{m.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send / Stop Button */}
            <button
              onClick={handleSend}
              className={`p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer border-none ${
                isStreaming
                  ? "bg-danger hover:bg-danger-hover text-white"
                  : text.trim()
                  ? "bg-accent hover:bg-accent-hover text-white"
                  : "bg-bg-tertiary text-text-muted"
              }`}
              disabled={!isStreaming && !text.trim()}
              aria-label={isStreaming ? "스트리밍 중지" : "메시지 전송"}
            >
              {isStreaming ? <Square size={14} /> : <ArrowUp size={16} />}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-text-muted text-center mt-2 select-none">
          AI는 실수할 수 있습니다. 중요한 정보는 반드시 확인하세요.
        </p>
      </div>
    </div>
  );
}
