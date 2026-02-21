import Anthropic from "@anthropic-ai/sdk";

export const config = { runtime: "edge", maxDuration: 60 };

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { messages } = (await req.json()) as ChatRequest;

  if (!messages?.length) {
    return new Response("messages required", { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return mockStream(messages);
  }

  const client = new Anthropic();

  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: "You are a helpful, friendly assistant. Answer concisely and clearly.",
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event.delta.text)}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function mockStream(messages: ChatMessage[]): Response {
  const lastMsg = messages[messages.length - 1].content.toLowerCase();
  const turnCount = messages.filter((m) => m.role === "user").length;

  let reply: string;
  if (lastMsg.includes("hello") || lastMsg.includes("hi")) {
    reply = "Hello! I'm Claude (mock mode). How can I help you today?";
  } else if (lastMsg.includes("name")) {
    reply = "I'm Claude, an AI assistant by Anthropic. Running in mock mode.";
  } else {
    reply = `Mock reply to: "${messages[messages.length - 1].content.slice(0, 50)}". This is turn #${turnCount}. Set ANTHROPIC_API_KEY for real responses.`;
  }

  const words = reply.split(" ");
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(word + " ")}\n\n`)
        );
        await new Promise((r) => setTimeout(r, 30));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
