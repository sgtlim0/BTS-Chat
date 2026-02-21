/**
 * Local dev API server for handling /api/chat requests.
 * Run with: npx tsx dev-server.ts
 * Then start Vite dev server separately: npm run dev
 * Vite proxies /api requests to this server (localhost:3000).
 */
import { createServer } from "http";
import { config } from "dotenv";

config({ path: ".env.local" });

const PORT = 3000;

interface BedrockMessage {
  role: "user" | "assistant";
  content: { text: string }[];
}

interface ChatRequest {
  messages: { role: string; content: string }[];
  model?: string;
  systemPrompt?: string;
}

const DEFAULT_MODEL = "us.anthropic.claude-sonnet-4-20250514-v1:0";

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url !== "/api/chat" || req.method !== "POST") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  try {
    const body = await readBody(req);
    const parsed: ChatRequest = JSON.parse(body);

    const apiKey = process.env.AWS_BEARER_TOKEN_BEDROCK;
    if (!apiKey) {
      console.warn("[dev-server] AWS_BEARER_TOKEN_BEDROCK not set. Mock mode.");
      sendMockStream(res, parsed.messages);
      return;
    }

    const region = process.env.AWS_BEDROCK_REGION || "us-east-1";
    const modelId = parsed.model || process.env.AWS_BEDROCK_MODEL_ID || DEFAULT_MODEL;

    const systemContent =
      parsed.systemPrompt ||
      "당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 정확하고 명확하게 답변해주세요. 한국어로 답변하되, 사용자가 다른 언어로 질문하면 해당 언어로 답변하세요.";

    const bedrockMessages: BedrockMessage[] = parsed.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: [{ text: m.content }],
      }));

    const bedrockUrl = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(modelId)}/converse`;

    const requestBody = {
      modelId,
      system: [{ text: systemContent }],
      messages: bedrockMessages,
      inferenceConfig: { maxTokens: 4096 },
    };

    console.log(`[dev-server] Calling Bedrock (${modelId})...`);

    const bedrockRes = await fetch(bedrockUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!bedrockRes.ok) {
      const errText = await bedrockRes.text();
      console.error(`[dev-server] Bedrock error: ${bedrockRes.status}`, errText);
      sendErrorStream(res, `Bedrock API 오류 (${bedrockRes.status}): ${errText}`);
      return;
    }

    const data = await bedrockRes.json();
    const textContent =
      data.output?.message?.content?.map((block: { text: string }) => block.text || "").join("") || "";

    if (!textContent) {
      sendErrorStream(res, "Bedrock에서 응답을 받지 못했습니다.");
      return;
    }

    console.log(`[dev-server] Response received (${textContent.length} chars). Streaming...`);

    // Stream word-by-word
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const words = textContent.split(/(\s+)/);
    for (const word of words) {
      if (word) {
        res.write(`data: ${JSON.stringify(word)}\n\n`);
        await sleep(15);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("[dev-server] Error:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Server error: ${err instanceof Error ? err.message : String(err)}`);
  }
});

function readBody(req: import("http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function sendErrorStream(res: import("http").ServerResponse, errorMsg: string) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
  res.write("data: [DONE]\n\n");
  res.end();
}

function sendMockStream(res: import("http").ServerResponse, messages: { role: string; content: string }[]) {
  const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || "";
  let reply: string;
  if (lastMsg.includes("안녕") || lastMsg.includes("hello")) {
    reply = "안녕하세요! 저는 Carat AI 어시스턴트입니다. 무엇을 도와드릴까요?";
  } else {
    reply = `"${messages[messages.length - 1]?.content.slice(0, 50)}"에 대한 응답입니다. AWS_BEARER_TOKEN_BEDROCK를 .env.local에 설정하면 실제 AI 응답을 받을 수 있습니다.`;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const words = reply.split(/(\s+)/);
  let i = 0;
  const interval = setInterval(() => {
    if (i >= words.length) {
      res.write("data: [DONE]\n\n");
      res.end();
      clearInterval(interval);
      return;
    }
    if (words[i]) {
      res.write(`data: ${JSON.stringify(words[i])}\n\n`);
    }
    i++;
  }, 30);
}

server.listen(PORT, () => {
  console.log(`[dev-server] API server running at http://localhost:${PORT}`);
  console.log(`[dev-server] AWS_BEARER_TOKEN_BEDROCK: ${process.env.AWS_BEARER_TOKEN_BEDROCK ? "set" : "NOT SET"}`);
  console.log(`[dev-server] Start Vite with: npm run dev`);
});
