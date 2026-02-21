import { create } from "zustand";
import { persist } from "zustand/middleware";

export const AVAILABLE_MODELS = [
  { id: "us.anthropic.claude-sonnet-4-20250514-v1:0", name: "Sonnet 4", description: "가장 뛰어난 코딩 모델" },
  { id: "us.anthropic.claude-3-5-sonnet-20241022-v2:0", name: "Sonnet 3.5", description: "빠르고 효율적" },
  { id: "us.anthropic.claude-3-5-haiku-20241022-v1:0", name: "Haiku 3.5", description: "빠른 응답, 가벼운 작업" },
] as const;

interface SettingsState {
  model: string;
  systemPrompt: string;
  temperature: number;
  setModel: (model: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setTemperature: (temp: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      model: "us.anthropic.claude-sonnet-4-20250514-v1:0",
      systemPrompt: "당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 정확하고 명확하게 답변해주세요.",
      temperature: 0.7,
      setModel: (model) => set({ model }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setTemperature: (temperature) => set({ temperature }),
    }),
    {
      name: "ai-chat-settings",
    }
  )
);
