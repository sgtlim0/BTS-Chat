import type { Message } from "@/entities/message/model";

interface StreamChatParams {
  messages: Pick<Message, "role" | "content">[];
  model: string;
  systemPrompt: string;
  onChunk: (chunk: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
  signal?: AbortSignal;
}

export async function streamChat({
  messages,
  model,
  systemPrompt,
  onChunk,
  onError,
  onDone,
  signal,
}: StreamChatParams): Promise<void> {
  const apiMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: apiMessages, model, systemPrompt }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    onError(`API 오류 (${res.status}): ${text}`);
    onDone();
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError("응답 본문이 없습니다");
    onDone();
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

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
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (typeof parsed === "string") {
            onChunk(parsed);
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

  onDone();
}
