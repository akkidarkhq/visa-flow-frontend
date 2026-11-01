export type ChatRole = "user" | "assistant";

export interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  provider?: string;
  contextGrounding?: boolean;
  suggestedFollowUps?: string[];
  isError?: boolean;
}

export interface ChatRequestPayload {
  message: string;
  history: ChatHistoryItem[];
  countryCode?: string;
  referenceNumber?: string;
}

export interface ChatResponseData {
  reply: string;
  provider?: string;
  contextGrounding?: boolean;
  suggestedFollowUps?: string[];
}

export interface ChatApiResponse {
  success: boolean;
  data?: ChatResponseData;
  message?: string;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PageChatContext {
  countryCode?: string;
  referenceNumber?: string;
}
