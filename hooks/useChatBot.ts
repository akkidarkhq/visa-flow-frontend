"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChatMessage,
  ChatHistoryItem,
  ChatRequestPayload,
  ChatResponseData,
  PageChatContext,
} from "@/types/chat";
import { apiFetch, ApiClientError } from "@/lib/api/client";

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-message",
  role: "assistant",
  content:
    "Hello! I am **VisaFlow AI**, your intelligent visa assistant. I have direct access to verified embassy rules, document checklists, and application guidelines.\n\nHow can I help you with your visa journey today?",
  timestamp: Date.now(),
  provider: "visaflow:local-rag",
  contextGrounding: true,
  suggestedFollowUps: [
    "What documents are needed for France Tourist Visa?",
    "What are Schengen photo specifications?",
    "How can I track my application status?",
    "What is the average processing time?",
  ],
};

export function useChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Page Context Auto-Detection
  const detectPageContext = useCallback((): PageChatContext => {
    const context: PageChatContext = {};

    // 1. Check query parameters
    if (searchParams) {
      const country =
        searchParams.get("countryCode") ||
        searchParams.get("country") ||
        searchParams.get("destination");
      if (country) context.countryCode = country.toUpperCase();

      const ref =
        searchParams.get("referenceNumber") ||
        searchParams.get("ref") ||
        searchParams.get("applicationId");
      if (ref) context.referenceNumber = ref;
    }

    // 2. Check path segments (e.g. /countries/FRA or /applications/GRP-2026-X8K9M2)
    if (pathname) {
      // Reference pattern like GRP-2026-X8K9M2 or APP-2026-1234
      const refMatch = pathname.match(/\b([A-Z]{3,4}-\d{4}-[A-Z0-9]+)\b/i);
      if (refMatch && !context.referenceNumber) {
        context.referenceNumber = refMatch[1].toUpperCase();
      }

      // Country codes in path (e.g. /country/FRA or /destinations/fra)
      const countryMatch = pathname.match(/(?:country|destination|visa)\/([a-z]{2,3})\b/i);
      if (countryMatch && !context.countryCode) {
        context.countryCode = countryMatch[1].toUpperCase();
      }
    }

    return context;
  }, [pathname, searchParams]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        timestamp: Date.now(),
      },
    ]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (textToSend?: string) => {
      const rawText = textToSend !== undefined ? textToSend : input;
      const trimmedText = rawText.trim();
      if (!trimmedText || isLoading) return;

      const userMessageId = `user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: "user",
        content: trimmedText,
        timestamp: Date.now(),
      };

      // Construct previous history excluding the welcome message or error messages
      const history: ChatHistoryItem[] = messages
        .filter((m) => m.id !== "welcome-message" && !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Append user message immediately
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setError(null);

      // Auto-detect current context
      const pageContext = detectPageContext();

      const payload: ChatRequestPayload = {
        message: trimmedText,
        history,
        countryCode: pageContext.countryCode,
        referenceNumber: pageContext.referenceNumber,
      };

      try {
        const response = await apiFetch<ChatResponseData>("/chat", {
          method: "POST",
          body: payload,
          requiresAuth: true,
        });

        if (response.success && response.data) {
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: response.data.reply,
            timestamp: Date.now(),
            provider: response.data.provider || "visaflow:local-rag",
            contextGrounding: response.data.contextGrounding ?? true,
            suggestedFollowUps: response.data.suggestedFollowUps || [],
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          throw new Error(response.message || "Failed to receive a valid response from VisaFlow AI.");
        }
      } catch (err: unknown) {
        let errorMessage = "Unable to reach VisaFlow AI backend. Please verify your connection.";
        if (err instanceof ApiClientError) {
          errorMessage = err.apiError.message || errorMessage;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        const errorAssistantMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Error**: ${errorMessage}\n\nPlease try asking again or check if the backend service is running.`,
          timestamp: Date.now(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorAssistantMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, detectPageContext]
  );

  return {
    isOpen,
    setIsOpen,
    toggleOpen,
    openChat,
    closeChat,
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    resetChat,
    pageContext: detectPageContext(),
  };
}
