import { useEffect } from "react";
import { useChatStore } from "@/shared/store/chatStore";
import { ChatPage } from "@/pages/chat/ChatPage";

export default function App() {
  const { activeSessionId, createSession } = useChatStore();

  useEffect(() => {
    if (!activeSessionId) {
      createSession();
    }
  }, []);

  return <ChatPage />;
}
