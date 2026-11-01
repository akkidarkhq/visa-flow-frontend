"use client";

import * as React from "react";
import { Bot, Sparkles, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageChatContext } from "@/types/chat";

interface ChatHeaderProps {
  onClose: () => void;
  onReset: () => void;
  pageContext?: PageChatContext;
  isConnecting?: boolean;
}

export function ChatHeader({
  onClose,
  onReset,
  pageContext,
  isConnecting = false,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-10 rounded-t-xl select-none">
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Bot className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm leading-tight">VisaFlow AI</span>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono">
              RAG
            </Badge>
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-primary" />
            Database Grounded Assistant
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Context badge if detected */}
        {pageContext?.countryCode && (
          <Badge variant="secondary" className="text-[10px] h-5 hidden sm:inline-flex">
            {pageContext.countryCode}
          </Badge>
        )}
        {pageContext?.referenceNumber && (
          <Badge variant="secondary" className="text-[10px] h-5 hidden sm:inline-flex max-w-[90px] truncate">
            {pageContext.referenceNumber}
          </Badge>
        )}

        {/* Reset Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onReset}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                aria-label="Reset conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Reset Chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
