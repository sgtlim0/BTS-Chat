import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, ChatSession, Source, RelatedQuestion } from "@/entities/message/model";
import { generateId } from "@/shared/lib/generateId";

interface ChatState {
  sessions: Record<string, ChatSession>;
  activeSessionId: string | null;
  isStreaming: boolean;
  searchQuery: string;

  createSession: () => string;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  togglePin: (id: string) => void;

  addMessage: (msg: Message) => void;
  deleteMessage: (msgId: string) => void;
  appendToLastMessage: (chunk: string) => void;
  finishStreaming: () => void;
  setStreaming: (value: boolean) => void;
  setSearchQuery: (query: string) => void;

  setMessageSources: (msgId: string, sources: Source[]) => void;
  setMessageRelatedQuestions: (msgId: string, questions: RelatedQuestion[]) => void;
  editMessage: (msgId: string, newContent: string) => void;

  getActiveMessages: () => Message[];
  clearActiveSession: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: {},
      activeSessionId: null,
      isStreaming: false,
      searchQuery: "",

      createSession: () => {
        const id = generateId();
        const session: ChatSession = {
          id,
          title: "새 채팅",
          messages: [],
          createdAt: Date.now(),
          pinned: false,
        };
        set((state) => ({
          sessions: { ...state.sessions, [id]: session },
          activeSessionId: id,
        }));
        return id;
      },

      switchSession: (id) => set({ activeSessionId: id }),

      deleteSession: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.sessions;
          const keys = Object.keys(rest);
          return {
            sessions: rest,
            activeSessionId:
              state.activeSessionId === id
                ? keys[0] ?? null
                : state.activeSessionId,
          };
        }),

      renameSession: (id, title) =>
        set((state) => {
          const session = state.sessions[id];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [id]: { ...session, title },
            },
          };
        }),

      togglePin: (id) =>
        set((state) => {
          const session = state.sessions[id];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [id]: { ...session, pinned: !session.pinned },
            },
          };
        }),

      addMessage: (msg) => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;

        set((state) => {
          const session = state.sessions[activeSessionId];
          if (!session) return state;

          const updatedSession = {
            ...session,
            messages: [...session.messages, msg],
            title:
              session.messages.length === 0 && msg.role === "user"
                ? msg.content.slice(0, 30) + (msg.content.length > 30 ? "..." : "")
                : session.title,
          };

          return {
            sessions: { ...state.sessions, [activeSessionId]: updatedSession },
          };
        });
      },

      deleteMessage: (msgId) => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;

        set((state) => {
          const session = state.sessions[activeSessionId];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: {
                ...session,
                messages: session.messages.filter((m) => m.id !== msgId),
              },
            },
          };
        });
      },

      appendToLastMessage: (chunk) => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;

        set((state) => {
          const session = state.sessions[activeSessionId];
          if (!session || session.messages.length === 0) return state;

          const msgs = [...session.messages];
          const last = { ...msgs[msgs.length - 1] };
          last.content += chunk;
          msgs[msgs.length - 1] = last;

          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: { ...session, messages: msgs },
            },
          };
        });
      },

      finishStreaming: () => set({ isStreaming: false }),

      setStreaming: (value) => set({ isStreaming: value }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setMessageSources: (msgId, sources) => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;
        set((state) => {
          const session = state.sessions[activeSessionId];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: {
                ...session,
                messages: session.messages.map((m) =>
                  m.id === msgId ? { ...m, sources } : m
                ),
              },
            },
          };
        });
      },

      setMessageRelatedQuestions: (msgId, questions) => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;
        set((state) => {
          const session = state.sessions[activeSessionId];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: {
                ...session,
                messages: session.messages.map((m) =>
                  m.id === msgId ? { ...m, relatedQuestions: questions } : m
                ),
              },
            },
          };
        });
      },

      editMessage: (msgId, newContent) => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;
        set((state) => {
          const session = state.sessions[activeSessionId];
          if (!session) return state;
          const msgIndex = session.messages.findIndex((m) => m.id === msgId);
          if (msgIndex === -1) return state;
          const updatedMessages = session.messages
            .slice(0, msgIndex + 1)
            .map((m) => (m.id === msgId ? { ...m, content: newContent } : m));
          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: { ...session, messages: updatedMessages },
            },
          };
        });
      },

      getActiveMessages: () => {
        const { activeSessionId, sessions } = get();
        if (!activeSessionId) return [];
        return sessions[activeSessionId]?.messages ?? [];
      },

      clearActiveSession: () => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;
        set((state) => {
          const session = state.sessions[activeSessionId];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [activeSessionId]: { ...session, messages: [], title: "새 채팅" },
            },
          };
        });
      },
    }),
    {
      name: "ai-chat-sessions",
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
