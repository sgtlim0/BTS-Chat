'use client'

import React, { useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { MessageItem } from './MessageItem'
import { SkeletonLoader } from '../skeleton/SkeletonLoader'
import { useChatStore } from '@/shared/store/chatStore'
import { QUICK_PROMPTS } from '@/shared/lib/constants'
import { sendMessage } from '@/features/send-message'

export function ChatWindow() {
  const { sessions, activeSessionId, isStreaming } = useChatStore()
  const parentRef = useRef<HTMLDivElement>(null)
  const session = activeSessionId ? sessions[activeSessionId] : null
  const messages = session?.messages || []

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, {
        align: 'end',
        behavior: 'smooth',
      })
    }
  }, [messages.length, virtualizer])

  const handleQuickPrompt = async (prompt: string) => {
    await sendMessage(prompt)
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-6 text-[var(--color-text-primary)]">
            무엇을 도와드릴까요?
          </h1>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleQuickPrompt(prompt)}
                className="p-4 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors text-left group"
              >
                <div className="text-[var(--color-text-primary)] font-medium">
                  {prompt}
                </div>
              </button>
            ))}
          </div>

          <p className="text-[var(--color-text-secondary)]">
            새 대화를 시작하려면 메시지를 입력하세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div ref={parentRef} className="h-full overflow-auto">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index]
            const isLast = virtualItem.index === messages.length - 1

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {isLast && isStreaming && message.role === 'assistant' && message.content === '' ? (
                  <div className="max-w-3xl mx-auto px-6 py-4">
                    <SkeletonLoader />
                  </div>
                ) : (
                  <MessageItem message={message} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}