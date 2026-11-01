"use client";

import * as React from "react";
import { Send, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  inputRef,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <div className="p-3 border-t border-border bg-card/95 backdrop-blur-md rounded-b-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim() && !isLoading) {
            onSend();
          }
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ask about visas, documents, fees..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="h-9 pr-8 text-xs bg-muted/40 focus-visible:bg-background transition-colors placeholder:text-muted-foreground/70"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none hidden sm:block">
            <CornerDownLeft className="h-3 w-3" />
          </div>
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={!value.trim() || isLoading}
          className="h-9 w-9 p-0 shrink-0 shadow-xs"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-muted-foreground/70">
        <span>Grounded with verified visa database</span>
        <span className="hidden sm:inline">Press Enter to send</span>
      </div>
    </div>
  );
}
