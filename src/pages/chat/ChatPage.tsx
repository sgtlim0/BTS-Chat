import { useState } from "react";
import { Sidebar } from "@/widgets/sidebar/Sidebar";
import { ChatWindow } from "@/widgets/chat-window/ChatWindow";
import { MessageInput } from "@/widgets/message-input/MessageInput";
import { ModelSettings } from "@/widgets/model-settings/ModelSettings";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { useSettingsStore } from "@/shared/store/settingsStore";
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

export function ChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const model = useSettingsStore((s) => s.model);
  const { sessions, activeSessionId } = useChatStore();
  const activeSession = activeSessionId ? sessions[activeSessionId] : null;

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-bg-primary">
          <div className="flex items-center gap-3">
            <button
              className="bg-transparent border-none text-text-secondary cursor-pointer p-1.5 rounded-md flex items-center gap-1.5 text-[13px] hover:bg-bg-tertiary hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent/30"
              onClick={() => setSidebarCollapsed((v) => !v)}
              aria-label={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <span className="text-xs px-2.5 py-1 bg-bg-tertiary rounded-full text-text-secondary">
              {model}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                className="bg-transparent border-none text-text-secondary cursor-pointer p-1.5 rounded-md flex items-center gap-1.5 text-[13px] hover:bg-bg-tertiary hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent/30"
                onClick={() => setShowExport((v) => !v)}
                aria-label="Export options"
              >
                <Download size={16} /> Export
              </button>
              {showExport && (
                <div className="absolute top-full right-0 mt-1 bg-bg-primary border border-border rounded-lg p-1 min-w-[160px] z-50 shadow-lg">
                  {activeSession && (
                    <>
                      <button
                        className="w-full bg-transparent border-none text-text-primary px-3 py-2 text-[13px] cursor-pointer rounded-md flex items-center gap-2 hover:bg-bg-tertiary transition-colors"
                        onClick={() => {
                          exportSessionMarkdown(activeSession);
                          setShowExport(false);
                        }}
                      >
                        <FileText size={14} /> Export as Markdown
                      </button>
                      <button
                        className="w-full bg-transparent border-none text-text-primary px-3 py-2 text-[13px] cursor-pointer rounded-md flex items-center gap-2 hover:bg-bg-tertiary transition-colors"
                        onClick={() => {
                          exportSessionJson(activeSession);
                          setShowExport(false);
                        }}
                      >
                        <FileJson size={14} /> Export as JSON
                      </button>
                    </>
                  )}
                  <button
                    className="w-full bg-transparent border-none text-text-primary px-3 py-2 text-[13px] cursor-pointer rounded-md flex items-center gap-2 hover:bg-bg-tertiary transition-colors"
                    onClick={() => {
                      exportAllSessionsJson(sessions);
                      setShowExport(false);
                    }}
                  >
                    <Download size={14} /> Export All (JSON)
                  </button>
                </div>
              )}
            </div>
            <button
              className="bg-transparent border-none text-text-secondary cursor-pointer p-1.5 rounded-md flex items-center gap-1.5 text-[13px] hover:bg-bg-tertiary hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent/30"
              onClick={() => setShowSettings(true)}
              aria-label="Open settings"
            >
              <Settings size={16} /> Settings
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
