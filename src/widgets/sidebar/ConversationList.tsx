'use client'

import React from 'react'
import { MessageSquare, Pin, Trash2 } from 'lucide-react'
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useChatStore } from '@/shared/store/chatStore'
import { ChatSession } from '@/entities/message'

export function ConversationList() {
  const { sessions, activeSessionId, switchSession, deleteSession, togglePin } = useChatStore()

  const sortedSessions = Object.values(sessions).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.updatedAt - a.updatedAt
  })

  const groupedSessions = groupSessionsByDate(sortedSessions)

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('이 대화를 삭제하시겠습니까?')) {
      deleteSession(id)
    }
  }

  const handlePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    togglePin(id)
  }

  return (
    <div className="px-2 py-2">
      {Object.entries(groupedSessions).map(([group, sessions]) => (
        <div key={group} className="mb-4">
          <div className="px-2 py-1 text-xs text-[var(--color-text-muted)] font-medium">
            {group}
          </div>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => switchSession(session.id)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[var(--color-sidebar-hover)] transition-colors text-left group ${
                session.id === activeSessionId ? 'bg-[var(--color-sidebar-active)]' : ''
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[var(--color-text-secondary)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[var(--color-text-primary)] truncate">
                  {session.title}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {session.messages.length} 메시지
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {session.pinned && (
                  <Pin className="w-3 h-3 text-[var(--color-accent)] fill-current" />
                )}
                <button
                  onClick={(e) => handlePin(e, session.id)}
                  className="p-1 rounded hover:bg-[var(--color-bg-tertiary)]"
                >
                  <Pin className={`w-3 h-3 ${session.pinned ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="p-1 rounded hover:bg-[var(--color-bg-tertiary)]"
                >
                  <Trash2 className="w-3 h-3 text-[var(--color-text-muted)]" />
                </button>
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

function groupSessionsByDate(sessions: ChatSession[]): Record<string, ChatSession[]> {
  const groups: Record<string, ChatSession[]> = {}

  sessions.forEach((session) => {
    const date = new Date(session.updatedAt)
    let group: string

    if (session.pinned) {
      group = '고정됨'
    } else if (isToday(date)) {
      group = '오늘'
    } else if (isYesterday(date)) {
      group = '어제'
    } else if (isThisWeek(date)) {
      group = '이번 주'
    } else if (isThisMonth(date)) {
      group = '이번 달'
    } else {
      group = format(date, 'yyyy년 MM월', { locale: ko })
    }

    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(session)
  })

  return groups
}