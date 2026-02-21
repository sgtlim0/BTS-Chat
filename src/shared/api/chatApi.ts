import type { Message, Source, RelatedQuestion } from "@/entities/message/model";

interface StreamChatParams {
  messages: Pick<Message, "role" | "content">[];
  model: string;
  systemPrompt: string;
  onChunk: (chunk: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
  onSources?: (sources: Source[]) => void;
  onRelatedQuestions?: (questions: RelatedQuestion[]) => void;
  signal?: AbortSignal;
  tools?: boolean;
}

function parseRelatedQuestions(content: string): { cleanContent: string; questions: RelatedQuestion[] } {
  const marker = "[RELATED_QUESTIONS]";
  const idx = content.indexOf(marker);
  if (idx === -1) return { cleanContent: content, questions: [] };

  const cleanContent = content.substring(0, idx).trim();
  const questionSection = content.substring(idx + marker.length);
  const questions = questionSection
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter((line) => line.length > 0)
    .map((text) => ({ text }));

  return { cleanContent, questions };
}

export async function streamChat({
  messages,
  model,
  systemPrompt,
  onChunk,
  onError,
  onDone,
  onSources,
  onRelatedQuestions,
  signal,
  tools = true,
}: StreamChatParams): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model, systemPrompt, tools }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    onError(`API error (${res.status}): ${text}`);
    onDone();
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError("No response body");
    onDone();
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") {
          const { cleanContent, questions } = parseRelatedQuestions(fullContent);
          if (questions.length > 0 && onRelatedQuestions) {
            onRelatedQuestions(questions);
          }
          if (cleanContent !== fullContent) {
            // Content was trimmed, we need to update the message
          }
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (typeof parsed === "string") {
            fullContent += parsed;
            onChunk(parsed);
          } else if (parsed.sources && onSources) {
            onSources(parsed.sources);
          } else if (parsed.error) {
            onError(parsed.error);
          }
        } catch {
          // skip malformed data
        }
      }
    }
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      onError((err as Error).message);
    }
  }

  const { cleanContent, questions } = parseRelatedQuestions(fullContent);
  if (questions.length > 0 && onRelatedQuestions) {
    onRelatedQuestions(questions);
  }
  if (cleanContent !== fullContent) {
    // Content was trimmed
  }
  onDone();
}
