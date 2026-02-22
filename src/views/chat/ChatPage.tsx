"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/widgets/sidebar/Sidebar";
import { ChatWindow } from "@/widgets/chat-window/ChatWindow";
import { MessageInput } from "@/widgets/message-input/MessageInput";
import { ModelSettings } from "@/widgets/model-settings/ModelSettings";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { useChatStore } from "@/shared/store/chatStore";
import {
  exportSessionMarkdown,
  exportSessionJson,
  exportAllSessionsJson,
} from "@/features/export-chat/exportChat";
import {
  PanelLeftOpen,
  PanelLeftClose,
  Settings,
  Download,
  FileText,
  FileJson,
} from "lucide-react";

export default function ChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const { sessions, activeSessionId, initStore } = useChatStore();
  const activeSession = activeSessionId ? sessions[activeSessionId] : null;

  useEffect(() => {
    initStore();
  }, [initStore]);

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-2 bg-bg-primary border-b border-transparent">
          <div className="flex items-center gap-2">
            <button
              className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-lg hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              onClick={() => setSidebarCollapsed((v) => !v)}
              aria-label={sidebarCollapsed ? "사이드바 열기" : "사이드바 닫기"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-lg hover:bg-bg-tertiary hover:text-text-primary transition-colors"
                onClick={() => setShowExport((v) => !v)}
                aria-label="내보내기 옵션"
              >
                <Download size={16} />
              </button>
              {showExport && (
                <div className="absolute top-full right-0 mt-1 bg-bg-primary border border-border rounded-xl p-1.5 min-w-[180px] z-50 shadow-lg">
                  {activeSession && (
                    <>
                      <button
                        className="w-full bg-transparent border-none text-text-primary px-3 py-2 text-[13px] cursor-pointer rounded-lg flex items-center gap-2 hover:bg-bg-tertiary transition-colors"
                        onClick={() => {
                          exportSessionMarkdown(activeSession);
                          setShowExport(false);
                        }}
                      >
                        <FileText size={14} className="text-text-muted" /> Markdown
                      </button>
                      <button
                        className="w-full bg-transparent border-none text-text-primary px-3 py-2 text-[13px] cursor-pointer rounded-lg flex items-center gap-2 hover:bg-bg-tertiary transition-colors"
                        onClick={() => {
                          exportSessionJson(activeSession);
                          setShowExport(false);
                        }}
                      >
                        <FileJson size={14} className="text-text-muted" /> JSON
                      </button>
                    </>
                  )}
                  <button
                    className="w-full bg-transparent border-none text-text-primary px-3 py-2 text-[13px] cursor-pointer rounded-lg flex items-center gap-2 hover:bg-bg-tertiary transition-colors"
                    onClick={() => {
                      exportAllSessionsJson(sessions);
                      setShowExport(false);
                    }}
                  >
                    <Download size={14} className="text-text-muted" /> 전체 내보내기
                  </button>
                </div>
              )}
            </div>
            <button
              className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-lg hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              onClick={() => setShowSettings(true)}
              aria-label="설정 열기"
            >
              <Settings size={16} />
            </button>
          </div>
        </header>

        <ErrorBoundary>
          <ChatWindow />
        </ErrorBoundary>
        <ErrorBoundary>
          <MessageInput />
        </ErrorBoundary>
      </div>

      {showSettings && <ModelSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
