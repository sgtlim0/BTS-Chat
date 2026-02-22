'use client'

import React from 'react'
import { MessageSquare } from 'lucide-react'
import { useChatStore } from '@/shared/store/chatStore'
import { searchMessages } from '@/features/search/searchMessages'

interface SearchPanelProps {
  onClose?: () => void
}

export function SearchPanel({ onClose }: SearchPanelProps) {
  const { sessions, searchQuery, switchSession } = useChatStore()
  const results = searchMessages(sessions, searchQuery)

  if (results.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          검색 결과가 없습니다
        </p>
      </div>
    )
  }

  return (
    <div className="px-2 py-2">
      <div className="px-2 py-1 text-xs text-[var(--color-text-muted)] font-medium mb-2">
        {results.length}개 결과
      </div>
      {results.map((result, index) => (
        <button
          key={`${result.sessionId}-${result.message.id}-${index}`}
          onClick={() => switchSession(result.sessionId)}
          className="w-full flex items-start gap-2 px-2 py-3 rounded-lg hover:bg-[var(--color-sidebar-hover)] transition-colors text-left"
        >
          <MessageSquare className="w-4 h-4 text-[var(--color-text-secondary)] flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-[var(--color-text-primary)] font-medium mb-1">
              {result.sessionTitle}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
              {result.matchedText}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">
              {result.message.role === 'user' ? '사용자' : 'Assistant'}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}