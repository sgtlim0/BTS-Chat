'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Square, ChevronDown } from 'lucide-react'
import { useChatStore } from '@/shared/store/chatStore'
import { useSettingsStore, AVAILABLE_MODELS } from '@/shared/store/settingsStore'
import { sendMessage, stopStreaming } from '@/features/send-message'

export function MessageInput() {
  const [input, setInput] = useState('')
  const [showModelPicker, setShowModelPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isStreaming } = useChatStore()
  const { model, setModel } = useSettingsStore()

  const currentModel = AVAILABLE_MODELS.find(m => m.id === model) || AVAILABLE_MODELS[0]

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isStreaming) {
      const message = input.trim()
      setInput('')
      await sendMessage(message)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleStop = () => {
    stopStreaming()
  }

  const selectModel = (modelId: string) => {
    setModel(modelId)
    setShowModelPicker(false)
  }

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="w-full p-4 pr-32 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] min-h-[56px] max-h-[200px]"
            disabled={isStreaming}
            rows={1}
          />

          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            {/* Model Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded transition-colors"
              >
                {currentModel.name}
                <ChevronDown className="w-3 h-3" />
              </button>

              {showModelPicker && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-[var(--color-border)] rounded-lg shadow-lg">
                  {AVAILABLE_MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => selectModel(m.id)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg-secondary)] transition-colors ${
                        m.id === model ? 'bg-[var(--color-accent-light)]' : ''
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send/Stop button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="p-2 bg-[var(--color-danger)] text-white rounded-lg hover:bg-[var(--color-danger-hover)] transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}