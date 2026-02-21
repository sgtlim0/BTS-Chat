import { memo, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import "highlight.js/styles/github.css";
import { Copy, Check, Trash2, RefreshCw, Wrench, Pencil } from "lucide-react";
import type { Message } from "@/entities/message/model";
import { SourceCards } from "@/widgets/sources/SourceCards";
import { RelatedQuestions } from "@/widgets/related-questions/RelatedQuestions";
import { SearchBadge } from "@/widgets/search-badge/SearchBadge";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), "className"],
    span: [...(defaultSchema.attributes?.span || []), "className"],
  },
};

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  isStreaming: boolean;
  onDelete?: (id: string) => void;
  onRetry?: (content: string) => void;
  onEdit?: (id: string, content: string) => void;
  onRelatedQuestionClick?: (text: string) => void;
}

function MessageItemRaw({
  message,
  isStreaming,
  onDelete,
  onRetry,
  onEdit,
  onRelatedQuestionClick,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [message.content]);

  const handleEditSubmit = useCallback(() => {
    if (onEdit && editText.trim() !== message.content) {
      onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
  }, [editText, message.id, message.content, onEdit]);

  const safeContent = message.content || "";
  const hasSources = message.sources && message.sources.length > 0;
  const hasRelatedQuestions = message.relatedQuestions && message.relatedQuestions.length > 0;

  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end mb-4 animate-[fadeIn_0.2s_ease-out] group">
        <div className="text-[11px] font-semibold text-text-muted mb-1 text-right">You</div>
        {isEditing ? (
          <div className="w-full max-w-[85%]">
            <textarea
              className="w-full p-3 border border-border rounded-xl bg-bg-input text-text-primary text-sm resize-none outline-none focus:border-accent"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEditSubmit();
                }
                if (e.key === "Escape") setIsEditing(false);
              }}
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-1 justify-end">
              <button
                className="text-xs text-text-muted hover:text-text-primary px-2 py-1 rounded"
                onClick={() => setIsEditing(false)}
                aria-label="Cancel editing"
              >
                Cancel
              </button>
              <button
                className="text-xs text-white bg-accent hover:bg-accent-hover px-3 py-1 rounded"
                onClick={handleEditSubmit}
                aria-label="Save edit"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-sm bg-user-bubble text-white text-sm leading-relaxed break-words">
            {safeContent}
          </div>
        )}
        {!isStreaming && !isEditing && (
          <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary hover:bg-bg-tertiary p-1 rounded"
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy message"}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
            {onEdit && (
              <button
                className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary hover:bg-bg-tertiary p-1 rounded"
                onClick={() => {
                  setEditText(message.content);
                  setIsEditing(true);
                }}
                aria-label="Edit message"
              >
                <Pencil size={12} /> Edit
              </button>
            )}
            {onRetry && (
              <button
                className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary hover:bg-bg-tertiary p-1 rounded"
                onClick={() => onRetry(message.content)}
                aria-label="Retry message"
              >
                <RefreshCw size={12} /> Retry
              </button>
            )}
            {onDelete && (
              <button
                className="flex items-center gap-1 text-[11px] text-text-muted hover:text-danger hover:bg-danger/10 p-1 rounded"
                onClick={() => onDelete(message.id)}
                aria-label="Delete message"
              >
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (message.role === "tool") {
    return (
      <div className="mb-4 animate-[fadeIn_0.2s_ease-out]">
        <div className="text-[11px] font-semibold text-text-muted mb-1 flex items-center gap-1">
          <Wrench size={11} /> Tool
        </div>
        <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-emerald-50 border border-emerald-200 text-sm leading-relaxed break-words text-emerald-900">
          {safeContent}
        </div>
      </div>
    );
  }

  // Assistant message - article style
  return (
    <div className="mb-6 animate-[fadeIn_0.2s_ease-out] group">
      <div className="text-[11px] font-semibold text-text-muted mb-2 flex items-center gap-1">
        AI
        {hasSources && <SearchBadge />}
      </div>

      {hasSources && <SourceCards sources={message.sources!} />}

      <div className="prose prose-sm max-w-none text-text-primary leading-relaxed
        [&_p]:mb-2 [&_p:last-child]:mb-0
        [&_ul]:my-1 [&_ul]:ml-5 [&_ol]:my-1 [&_ol]:ml-5
        [&_table]:border-collapse [&_table]:my-2 [&_table]:w-full
        [&_th]:border [&_th]:border-border [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-[13px] [&_th]:bg-bg-tertiary
        [&_td]:border [&_td]:border-border [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:text-[13px]
        [&_pre]:bg-gray-50 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-2 [&_pre]:border [&_pre]:border-border
        [&_code]:font-mono [&_code]:text-[13px]
        [&_:not(pre)>code]:bg-bg-tertiary [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:text-xs
        [&_blockquote]:border-l-3 [&_blockquote]:border-accent [&_blockquote]:my-2 [&_blockquote]:px-3 [&_blockquote]:text-text-secondary
        [&_a]:text-accent [&_a]:no-underline [&_a:hover]:underline
      ">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, [rehypeSanitize, sanitizeSchema]]}
        >
          {safeContent}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 align-text-bottom animate-[blink_0.8s_infinite]" />
        )}
      </div>

      {!isStreaming && hasRelatedQuestions && onRelatedQuestionClick && (
        <RelatedQuestions
          questions={message.relatedQuestions!}
          onQuestionClick={onRelatedQuestionClick}
        />
      )}

      {!isStreaming && (
        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary hover:bg-bg-tertiary p-1 rounded"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy message"}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
          {onDelete && (
            <button
              className="flex items-center gap-1 text-[11px] text-text-muted hover:text-danger hover:bg-danger/10 p-1 rounded"
              onClick={() => onDelete(message.id)}
              aria-label="Delete message"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const MessageItem = memo(MessageItemRaw);
