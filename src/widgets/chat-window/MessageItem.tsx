'use client'

import React, { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import { Copy, Check, Edit2, Trash2, RotateCcw } from 'lucide-react'
import { Message } from '@/entities/message'
import { useChatStore } from '@/shared/store/chatStore'
import { sendMessage } from '@/features/send-message'
import '@/app/highlight.css'

interface MessageItemProps {
  message: Message
}

export const MessageItem = memo(function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const { activeSessionId, deleteMessage } = useChatStore()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = () => {
    if (activeSessionId) {
      deleteMessage(activeSessionId, message.id)
    }
  }

  const handleRetry = async () => {
    if (message.role === 'user') {
      await sendMessage(message.content)
    }
  }

  const handleEdit = async () => {
    if (isEditing && editContent !== message.content && activeSessionId) {
      // Delete this and all following messages
      const session = useChatStore.getState().sessions[activeSessionId]
      const messageIndex = session.messages.findIndex(m => m.id === message.id)

      // Delete all messages from this one onwards
      for (let i = session.messages.length - 1; i >= messageIndex; i--) {
        deleteMessage(activeSessionId, session.messages[i].id)
      }

      // Send the edited message
      await sendMessage(editContent)
    }
    setIsEditing(!isEditing)
  }

  const isUser = message.role === 'user'

  return (
    <div className={`group px-6 py-4 ${isUser ? 'bg-transparent' : 'bg-[var(--color-bg-secondary)]'}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
          }`}>
            <span className="text-white text-sm font-medium">
              {isUser ? 'U' : 'A'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-[var(--color-text-primary)]">
                {isUser ? '사용자' : 'Assistant'}
              </span>
              {message.model && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  {message.model}
                </span>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                rows={4}
                autoFocus
              />
            ) : (
              <div className="prose prose-sm max-w-none text-[var(--color-text-primary)]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeSanitize]}
                  components={{
                    pre: ({ children }) => (
                      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                        {children}
                      </pre>
                    ),
                    code: ({ className, children, ...props }) => {
                      const isInline = !className
                      return isInline ? (
                        <code className="bg-[var(--color-bg-tertiary)] px-1 rounded" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] transition-colors"
                title="복사"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[var(--color-success)]" />
                ) : (
                  <Copy className="w-4 h-4 text-[var(--color-text-muted)]" />
                )}
              </button>

              {isUser && (
                <button
                  onClick={handleEdit}
                  className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] transition-colors"
                  title={isEditing ? '저장' : '수정'}
                >
                  <Edit2 className="w-4 h-4 text-[var(--color-text-muted)]" />
                </button>
              )}

              <button
                onClick={handleRetry}
                className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] transition-colors"
                title="다시 시도"
              >
                <RotateCcw className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>

              <button
                onClick={handleDelete}
                className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] transition-colors"
                title="삭제"
              >
                <Trash2 className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})