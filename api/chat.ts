import { z } from "zod";

export const config = { runtime: "edge", maxDuration: 60 };

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(200),
  model: z.string().max(100).optional(),
  systemPrompt: z.string().max(10000).optional(),
});

interface BedrockMessage {
  readonly role: "user" | "assistant";
  readonly content: readonly { text: string }[];
}

interface BedrockConverseRequest {
  readonly modelId: string;
  readonly system: readonly { text: string }[];
  readonly messages: readonly BedrockMessage[];
  readonly inferenceConfig: {
    readonly maxTokens: number;
    readonly temperature?: number;
  };
}

interface BedrockConverseResponse {
  readonly output: {
    readonly message: {
      readonly role: string;
      readonly content: readonly { text: string }[];
    };
  };
}

const DEFAULT_MODEL = "us.anthropic.claude-sonnet-4-20250514-v1:0";

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { messages, model, systemPrompt } = parsed.data;

    const apiKey = (globalThis as any).process?.env?.AWS_BEARER_TOKEN_BEDROCK;
    if (!apiKey) {
      console.warn("[api/chat] AWS_BEARER_TOKEN_BEDROCK is not set. Running in mock mode.");
      return mockStream(messages);
    }

    const region = (globalThis as any).process?.env?.AWS_BEDROCK_REGION || "us-east-1";
    const modelId = model || (globalThis as any).process?.env?.AWS_BEDROCK_MODEL_ID || DEFAULT_MODEL;

    const systemContent =
      systemPrompt ||
      "당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 정확하고 명확하게 답변해주세요. 한국어로 답변하되, 사용자가 다른 언어로 질문하면 해당 언어로 답변하세요.";

    const bedrockMessages: BedrockMessage[] = messages.map((m) => ({
      role: m.role,
      content: [{ text: m.content }],
    }));

    const bedrockUrl = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(modelId)}/converse`;

    const requestBody: BedrockConverseRequest = {
      modelId,
      system: [{ text: systemContent }],
      messages: bedrockMessages,
      inferenceConfig: {
        maxTokens: 4096,
      },
    };

    let bedrockRes: globalThis.Response;
    try {
      bedrockRes = await fetch(bedrockUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      return errorStream(`Bedrock 연결 실패: ${msg}`);
    }

    if (!bedrockRes.ok) {
      const errText = await bedrockRes.text();
      return errorStream(`Bedrock API 오류 (${bedrockRes.status}): ${errText}`);
    }

    const data: BedrockConverseResponse = await bedrockRes.json();

    const textContent =
      data.output?.message?.content?.map((block) => block.text || "").join("") || "";

    if (!textContent) {
      return errorStream("Bedrock에서 응답을 받지 못했습니다.");
    }

    // Stream the response word-by-word for a smooth UX
    const encoder = new TextEncoder();
    const words = textContent.split(/(\s+)/);

    const readable = new ReadableStream({
      async start(controller) {
        for (const word of words) {
          if (word) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(word)}\n\n`));
            await new Promise((r) => setTimeout(r, 15));
          }
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`Server error: ${msg}`, { status: 500 });
  }
}

function errorStream(errorMsg: string): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`));
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

function mockStream(messages: z.infer<typeof chatMessageSchema>[]): Response {
  const lastMsg = messages[messages.length - 1].content.toLowerCase();
  const turnCount = messages.filter((m) => m.role === "user").length;

  let reply: string;
  if (lastMsg.includes("hello") || lastMsg.includes("hi") || lastMsg.includes("안녕")) {
    reply = "안녕하세요! 저는 AI 어시스턴트입니다 (목 모드). 무엇을 도와드릴까요?";
  } else if (lastMsg.includes("time") || lastMsg.includes("시간")) {
    reply = `현재 시간: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`;
  } else {
    reply = `"${messages[messages.length - 1].content.slice(0, 50)}"에 대한 목 응답입니다. (대화 #${turnCount}). AWS_BEARER_TOKEN_BEDROCK를 설정하면 실제 AI 응답을 받을 수 있습니다.`;
  }

  const words = reply.split(/(\s+)/);
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        if (word) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(word)}\n\n`));
          await new Promise((r) => setTimeout(r, 30));
        }
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
