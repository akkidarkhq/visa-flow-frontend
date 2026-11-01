"use client";

import * as React from "react";
import { useEffect, useRef, Suspense } from "react";
import { Bot, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatBot } from "@/hooks/useChatBot";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { cn } from "@/lib/utils";

function ChatWidgetContent() {
  const {
    isOpen,
    toggleOpen,
    closeChat,
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    resetChat,
    pageContext,
  } = useChatBot();

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when chat is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeChat]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Card */}
      {isOpen && (
        <Card
          className={cn(
            "fixed inset-x-3 bottom-20 sm:static sm:inset-auto mb-3",
            "w-[calc(100vw-1.5rem)] sm:w-96 h-[560px] max-h-[calc(100vh-6rem)]",
            "flex flex-col shadow-2xl border-border bg-card/95 backdrop-blur-xl",
            "rounded-2xl overflow-hidden transition-all duration-200",
            "animate-in fade-in-50 zoom-in-95 slide-in-from-bottom-4"
          )}
        >
          <ChatHeader
            onClose={closeChat}
            onReset={resetChat}
            pageContext={pageContext}
            isConnecting={isLoading}
          />

          <ChatMessageList
            messages={messages}
            isLoading={isLoading}
            onSelectSuggestion={(suggestionText) => sendMessage(suggestionText)}
          />

          <ChatInput
            inputRef={inputRef}
            value={input}
            onChange={setInput}
            onSend={() => sendMessage()}
            isLoading={isLoading}
          />
        </Card>
      )}

      {/* Floating Circular Launcher Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={toggleOpen}
              className={cn(
                "relative h-14 w-14 rounded-full shadow-xl transition-all duration-300",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-primary/20",
                "flex items-center justify-center p-0"
              )}
              aria-label={isOpen ? "Close VisaFlow AI chat" : "Ask VisaFlow AI"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-6 w-6 transition-transform duration-200" />
              ) : (
                <>
                  <div className="relative">
                    <Bot className="h-6 w-6" />
                    <Sparkles className="h-3 w-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  {/* Active online pulse ring */}
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background"></span>
                  </span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          {!isOpen && (
            <TooltipContent side="left" className="mr-2 font-medium">
              Ask VisaFlow AI
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function ChatWidget() {
  return (
    <Suspense fallback={null}>
      <ChatWidgetContent />
    </Suspense>
  );
}

export default ChatWidget;
