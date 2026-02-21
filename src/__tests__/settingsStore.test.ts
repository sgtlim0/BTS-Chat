import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "@/shared/store/settingsStore";

describe("settingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      model: "gpt-4o-mini",
      systemPrompt: "You are a helpful, friendly assistant. Answer concisely and clearly.",
      temperature: 0.7,
    });
  });

  it("has correct default values", () => {
    const state = useSettingsStore.getState();
    expect(state.model).toBe("gpt-4o-mini");
    expect(state.temperature).toBe(0.7);
  });

  it("sets model", () => {
    useSettingsStore.getState().setModel("gpt-4o");
    expect(useSettingsStore.getState().model).toBe("gpt-4o");
  });

  it("sets system prompt", () => {
    useSettingsStore.getState().setSystemPrompt("Custom prompt");
    expect(useSettingsStore.getState().systemPrompt).toBe("Custom prompt");
  });

  it("sets temperature", () => {
    useSettingsStore.getState().setTemperature(1.5);
    expect(useSettingsStore.getState().temperature).toBe(1.5);
  });
});
