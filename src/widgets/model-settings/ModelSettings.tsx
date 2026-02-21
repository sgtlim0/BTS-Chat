import { useEffect, useRef } from "react";
import { useSettingsStore, AVAILABLE_MODELS } from "@/shared/store/settingsStore";

interface ModelSettingsProps {
  onClose: () => void;
}

export function ModelSettings({ onClose }: ModelSettingsProps) {
  const { model, systemPrompt, temperature, setModel, setSystemPrompt, setTemperature } =
    useSettingsStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="bg-bg-primary border border-border rounded-2xl p-7 w-[420px] max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="m-0 mb-5 text-lg text-text-primary font-semibold">Settings</h2>

        <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
          Model
        </label>
        <select
          className="w-full p-2.5 bg-bg-tertiary border border-border rounded-lg text-text-primary text-sm outline-none mb-5 focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          aria-label="Select model"
        >
          {AVAILABLE_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
          System Prompt
        </label>
        <textarea
          className="w-full p-2.5 bg-bg-tertiary border border-border rounded-lg text-text-primary text-[13px] font-inherit outline-none resize-y min-h-[80px] mb-5 focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="System prompt for the AI..."
          aria-label="System prompt"
        />

        <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
          Temperature
        </label>
        <div className="flex items-center gap-3 mb-5">
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="flex-1 accent-accent"
            aria-label="Temperature"
          />
          <span className="text-sm text-text-primary min-w-[32px] text-right">
            {temperature}
          </span>
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            className="px-5 py-2.5 rounded-lg text-sm cursor-pointer border-none bg-bg-tertiary text-text-secondary hover:bg-border transition-colors focus-visible:ring-2 focus-visible:ring-accent/30"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
