export type Role = "user" | "assistant" | "tool";

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface Source {
  url: string;
  title: string;
  domain: string;
  snippet: string;
  favicon?: string;
}

export interface RelatedQuestion {
  text: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  sources?: Source[];
  relatedQuestions?: RelatedQuestion[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  pinned?: boolean;
}
