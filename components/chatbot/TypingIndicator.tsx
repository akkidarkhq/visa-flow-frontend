import * as React from "react";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 my-2 animate-in fade-in-50 duration-300">
      <Avatar className="h-7 w-7 border border-primary/20 bg-primary/10 text-primary">
        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
          <Bot className="h-3.5 w-3.5 animate-pulse" />
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted/80 px-3.5 py-2.5 text-xs text-muted-foreground border border-border shadow-xs">
        <span className="text-[11px] font-medium mr-1 text-foreground/70">VisaFlow AI is thinking</span>
        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" />
      </div>
    </div>
  );
}
