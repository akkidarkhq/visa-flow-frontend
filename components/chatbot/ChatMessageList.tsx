"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageItem } from "./ChatMessageItem";
import { TypingIndicator } from "./TypingIndicator";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectSuggestion: (text: string) => void;
}

export function ChatMessageList({
  messages,
  isLoading,
  onSelectSuggestion,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <ScrollArea viewportRef={viewportRef} className="flex-1 px-4 py-3">
      <div className="flex flex-col min-h-full justify-end">
        {messages.map((message, index) => {
          const isLatestAssistantMessage =
            message.role === "assistant" &&
            index === messages.length - 1;

          return (
            <ChatMessageItem
              key={message.id}
              message={message}
              onSelectSuggestion={onSelectSuggestion}
              isLatestAssistantMessage={isLatestAssistantMessage}
              disabledSuggestions={isLoading}
            />
          );
        })}

        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} className="h-1" />
      </div>
    </ScrollArea>
  );
}
