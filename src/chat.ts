const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export interface ChatOptions {
  model?: string;
  systemPrompt?: string;
  apiKey?: string;
  mock?: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GeminiCandidate {
  content: { parts: { text: string }[] };
}

interface GeminiStreamChunk {
  candidates?: GeminiCandidate[];
}

export class Chat {
  private messages: Message[] = [];
  private model: string;
  private systemPrompt: string | undefined;
  private apiKey: string | undefined;
  private mock: boolean;

  constructor(options: ChatOptions = {}) {
    this.mock = options.mock ?? false;
    this.apiKey = options.apiKey;
    this.model = options.model ?? "gemini-2.0-flash";
    this.systemPrompt = options.systemPrompt;
  }

  async *sendStream(userMessage: string): AsyncGenerator<string> {
    this.messages.push({ role: "user", content: userMessage });

    if (this.mock) {
      yield* this.mockStream(userMessage);
      return;
    }

    const contents = this.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = { contents };
    if (this.systemPrompt) {
      body.systemInstruction = { parts: [{ text: this.systemPrompt }] };
    }

    const url = `${GEMINI_BASE_URL}/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${err}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (!data) continue;
        try {
          const parsed = JSON.parse(data) as GeminiStreamChunk;
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            chunks.push(text);
            yield text;
          }
        } catch {}
      }
    }

    this.messages.push({ role: "assistant", content: chunks.join("") });
  }

  private async *mockStream(userMessage: string): AsyncGenerator<string> {
    const prevCount = this.messages.filter((m) => m.role === "user").length;
    const reply = this.generateMockReply(userMessage, prevCount);

    const words = reply.split(" ");
    const chunks: string[] = [];

    for (const word of words) {
      const chunk = (chunks.length > 0 ? " " : "") + word;
      chunks.push(chunk);
      yield chunk;
      if (process.stdin.isTTY) {
        await delay(30 + Math.random() * 50);
      }
    }

    this.messages.push({ role: "assistant", content: chunks.join("") });
  }

  private generateMockReply(input: string, turnCount: number): string {
    const lower = input.toLowerCase();

    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
      return "Hello! I'm Gemini (mock mode). How can I help you today?";
    }
    if (lower.includes("name")) {
      return "I'm Gemini, a language model by Google. Currently running in mock mode for testing.";
    }
    if (lower.includes("remember") || lower.includes("said")) {
      if (turnCount > 1) {
        const firstMsg = this.messages.find((m) => m.role === "user")?.content ?? "";
        return `From our conversation, your first message was: "${firstMsg}". I keep track of our full conversation history.`;
      }
      return "This is the start of our conversation, so there's nothing to recall yet!";
    }

    const responses = [
      `That's an interesting point about "${input.slice(0, 40)}". In mock mode, I simulate streaming token by token.`,
      `You said: "${input.slice(0, 40)}". This is turn #${turnCount}. The multi-turn history is working correctly!`,
      `Great question! This mock response simulates Gemini API streaming. Your message had ${input.length} characters.`,
    ];

    return responses[turnCount % responses.length];
  }

  reset(): void {
    this.messages = [];
  }

  get history(): ReadonlyArray<Message> {
    return this.messages;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
