import { useEffect, useRef, useCallback, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, Sparkles, Palette, LayoutGrid, MessageSquare } from "lucide-react";
import { useChatStore } from "@/shared/store/chatStore";
import { sendMessage } from "@/features/send-message/sendMessage";
import { MessageItem } from "./MessageItem";
import { SkeletonLoader } from "@/widgets/skeleton/SkeletonLoader";

function estimateMessageSize(msg: { content: string; role: string; sources?: unknown[] }): number {
  const baseHeight = 80;
  const charsPerLine = 80;
  const lineHeight = 24;
  const lines = Math.ceil(msg.content.length / charsPerLine);
  const contentHeight = lines * lineHeight;
  const sourcesHeight = msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0 ? 100 : 0;
  return Math.max(baseHeight, contentHeight + sourcesHeight + 60);
}

const QUICK_PROMPTS = [
  { icon: Sparkles, label: "블로그 글쓰기", prompt: "블로그에 올릴 글을 작성해주세요" },
  { icon: MessageSquare, label: "번역하기", prompt: "영어를 한국어로 번역해주세요" },
  { icon: Palette, label: "아이디어 브레인스토밍", prompt: "새로운 프로젝트 아이디어를 브레인스토밍해주세요" },
  { icon: LayoutGrid, label: "코드 작성", prompt: "코드 작성을 도와주세요" },
];

export function ChatWindow() {
  const sessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const editMessage = useChatStore((s) => s.editMessage);

  const messages =
    activeSessionId && sessions[activeSessionId]
      ? sessions[activeSessionId].messages
      : [];

  const parentRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const isAutoScrolling = useRef(true);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => estimateMessageSize(messages[index]),
    overscan: 5,
  });

  const scrollToBottom = useCallback(() => {
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
      isAutoScrolling.current = true;
      setShowScrollBtn(false);
    }
  }, [messages.length, virtualizer]);

  useEffect(() => {
    if (isAutoScrolling.current && messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
    }
  }, [messages.length, messages[messages.length - 1]?.content, isStreaming, virtualizer]);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      if (distanceFromBottom > 200) {
        isAutoScrolling.current = false;
        setShowScrollBtn(true);
      } else {
        isAutoScrolling.current = true;
        setShowScrollBtn(false);
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const handleRetry = useCallback((content: string) => {
    sendMessage(content);
  }, []);

  const handleDelete = useCallback(
    (msgId: string) => {
      deleteMessage(msgId);
    },
    [deleteMessage]
  );

  const handleEdit = useCallback(
    (msgId: string, newContent: string) => {
      editMessage(msgId, newContent);
      sendMessage(newContent);
    },
    [editMessage]
  );

  const handleQuickPrompt = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, []);

  if (messages.length === 0) {
    return (
      <div ref={parentRef} className="flex-1 overflow-y-auto relative">
        <div className="flex flex-col items-center justify-center h-full gap-6 px-4 max-w-2xl mx-auto">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6d28d9 100%)" }}
            >
              <span>✦</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium text-accent">AI Chat</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2 bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #7c3aed, #a855f7, #6d28d9)",
                backgroundSize: "200% 200%",
                animation: "gradient-shift 4s ease infinite",
              }}
            >
              무엇을 도와드릴까요?
            </h1>
            <p className="text-[14px] text-text-muted leading-relaxed max-w-md mx-auto">
              AI가 글쓰기, 번역, 코딩, 분석 등 다양한 작업을 도와드립니다.
              <br />
              아래 버튼을 누르거나 직접 메시지를 입력해보세요.
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-lg mt-2">
            {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-bg-primary text-left cursor-pointer hover:bg-accent-light hover:border-accent/30 transition-all group"
                onClick={() => handleQuickPrompt(prompt)}
              >
                <div className="w-9 h-9 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                  <Icon size={18} className="text-accent" />
                </div>
                <div>
                  <span className="text-[13px] font-medium text-text-primary block">{label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="flex items-center gap-6 mt-4">
            {[
              { label: "Claude AI", desc: "Bedrock" },
              { label: "실시간 스트리밍", desc: "빠른 응답" },
              { label: "마크다운", desc: "서식 지원" },
            ].map(({ label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-[12px] font-medium text-text-secondary">{label}</span>
                <span className="text-[11px] text-text-muted">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const lastMsg = messages[messages.length - 1];
  const showSkeleton = isStreaming && lastMsg?.role === "assistant" && lastMsg.content === "";

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto relative">
      <div
        className="max-w-[720px] mx-auto relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const msg = messages[virtualRow.index];
          const idx = virtualRow.index;
          return (
            <div
              key={msg.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                padding: "0 24px",
              }}
            >
              {showSkeleton && idx === messages.length - 1 ? (
                <SkeletonLoader />
              ) : (
                <MessageItem
                  message={msg}
                  isLast={idx === messages.length - 1}
                  isStreaming={
                    isStreaming && idx === messages.length - 1 && msg.role === "assistant"
                  }
                  onDelete={handleDelete}
                  onRetry={msg.role === "user" ? handleRetry : undefined}
                  onEdit={msg.role === "user" ? handleEdit : undefined}
                />
              )}
            </div>
          );
        })}
      </div>

      {showScrollBtn && (
        <button
          className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-bg-primary border border-border text-text-secondary cursor-pointer px-3.5 py-2 rounded-full text-[12px] flex items-center gap-1.5 z-10 shadow-sm hover:bg-bg-secondary transition-colors"
          onClick={scrollToBottom}
          aria-label="아래로 스크롤"
        >
          <ArrowDown size={13} /> 새 메시지
        </button>
      )}
    </div>
  );
}
