# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Carat AI Chat — a React 19 SPA with real-time streaming chat powered by AWS Bedrock (Claude models). Features multi-session management, markdown rendering, message virtualization, and conversation export. Korean-first UI inspired by carat.im.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + Vite production build
npm run test         # Run all tests (vitest)
npm run test:watch   # Run tests in watch mode
```

Deploy to Vercel:
```bash
npx vercel --token $VERCEL_TOKEN --yes         # Preview deploy
npx vercel --prod --token $VERCEL_TOKEN --yes  # Production deploy
```

## Environment Variables

```
AWS_BEARER_TOKEN_BEDROCK=<your-bedrock-api-key>
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-20250514-v1:0
```

## Architecture

**FSD (Feature-Sliced Design)** with layers:

- `src/app/` — Root component, global styles, entry point
- `src/pages/chat/` — ChatPage layout (sidebar + main area)
- `src/widgets/` — Composite UI components (ChatWindow, Sidebar, MessageInput, ModelSettings)
- `src/features/` — Business logic (sendMessage, searchMessages, exportChat)
- `src/entities/message/` — Domain types (Message, ChatSession)
- `src/shared/` — Store (Zustand), API client, utilities

**State Management**: Zustand with `persist` middleware. Two stores:
- `chatStore` — Sessions, messages, streaming state. Sessions stored as `Record<string, ChatSession>`.
- `settingsStore` — Model selection (Claude Sonnet 4, Sonnet 3.5, Haiku 3.5), system prompt, temperature.

**API Layer**: `api/chat.ts` is a Vercel Edge Runtime serverless function. It calls AWS Bedrock Converse API with Bearer Token authentication. Response is streamed back to client via SSE (word-by-word).

**Styling**: Tailwind CSS 4 with custom theme variables. Pretendard font for Korean typography.

## Key Patterns

- Path alias: `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`)
- Messages are streamed via SSE: API sends `data: "chunk"\n\n` format, client parses in `streamChat()`
- `sendMessage()` is a standalone function (not a hook) that imperatively calls `useChatStore.getState()`
- Virtualizer: ChatWindow uses `@tanstack/react-virtual` for large message lists
- MessageItem is `memo()`-wrapped and renders Markdown via `react-markdown` + `remark-gfm` + `rehype-highlight`
- Model picker is inline with the message input (bottom-right)

## Testing

Tests use Vitest with jsdom environment. Path aliases work via `vitest.config.ts`. Store tests reset state in `beforeEach` using `useChatStore.setState()`.
