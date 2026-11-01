import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({
  suggestions,
  onSelect,
  disabled = false,
}: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-2 pl-9">
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion}-${index}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(suggestion)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-all duration-150 hover:border-primary/40 hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 text-left"
        >
          <Sparkles className="h-3 w-3 shrink-0 text-primary/70 group-hover:text-primary transition-colors" />
          <span className="truncate max-w-[240px]">{suggestion}</span>
        </button>
      ))}
    </div>
  );
}
