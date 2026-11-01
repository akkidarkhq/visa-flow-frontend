"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, CheckCircle2, ShieldCheck } from "lucide-react";
import { ChatMessage } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SuggestionChips } from "./SuggestionChips";
import { cn } from "@/lib/utils";

interface ChatMessageItemProps {
  message: ChatMessage;
  onSelectSuggestion?: (text: string) => void;
  isLatestAssistantMessage?: boolean;
  disabledSuggestions?: boolean;
}

export function ChatMessageItem({
  message,
  onSelectSuggestion,
  isLatestAssistantMessage = false,
  disabledSuggestions = false,
}: ChatMessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 my-3 animate-in fade-in-30 slide-in-from-bottom-1 duration-200",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "flex items-start gap-2 max-w-[92%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <Avatar
          className={cn(
            "h-7 w-7 shrink-0 text-xs shadow-xs",
            isUser
              ? "bg-foreground text-background"
              : "bg-primary text-primary-foreground"
          )}
        >
          <AvatarFallback className={isUser ? "bg-foreground text-background" : "bg-primary text-primary-foreground"}>
            {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
          </AvatarFallback>
        </Avatar>

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed overflow-hidden",
            isUser
              ? "rounded-tr-xs bg-primary text-primary-foreground"
              : message.isError
              ? "rounded-tl-xs bg-destructive/10 text-destructive border border-destructive/20"
              : "rounded-tl-xs bg-muted/60 text-foreground border border-border"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-xs dark:prose-invert max-w-none text-xs break-words space-y-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-1.5 list-disc pl-4 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-1.5 list-decimal pl-4 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-snug">{children}</li>
                  ),
                  table: ({ children }) => (
                    <div className="my-2 w-full overflow-x-auto rounded-md border border-border">
                      <table className="w-full text-[11px] text-left border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted font-semibold text-foreground border-b border-border">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-border">{children}</tbody>
                  ),
                  tr: ({ children }) => <tr className="hover:bg-muted/40 transition-colors">{children}</tr>,
                  th: ({ children }) => (
                    <th className="px-2 py-1.5 font-semibold text-foreground">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-2 py-1.5 align-top">{children}</td>
                  ),
                  code: ({ children }) => (
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground border border-border">
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/50 pl-2 italic my-1 text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* RAG Grounding Verification Badge */}
              {message.contextGrounding && !message.isError && (
                <div className="flex items-center gap-1 pt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Grounding verified with database RAG</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Suggested Follow-Ups (Rendered beneath assistant answers) */}
      {!isUser &&
        message.suggestedFollowUps &&
        message.suggestedFollowUps.length > 0 &&
        onSelectSuggestion && (
          <SuggestionChips
            suggestions={message.suggestedFollowUps}
            onSelect={onSelectSuggestion}
            disabled={disabledSuggestions}
          />
        )}
    </div>
  );
}
