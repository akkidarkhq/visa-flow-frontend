"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: string;
  label: string;
  desc?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepItem[];
  activeStep: string | number;
  onStepClick?: (step: StepItem, index: number) => void;
  allowClickCompleted?: boolean;
}

// 1. Step 1: Checklist icon (List with checkmarks)
function ChecklistIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="m3 17 2 2 4-4" />
      <path d="M13 16h8" />
    </svg>
  );
}

// 2. Step 2: Workflow nodes icon (Two connected blocks)
function WorkflowNodesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="6.5" height="6.5" x="3" y="3" rx="1.5" />
      <rect width="6.5" height="6.5" x="14.5" y="14.5" rx="1.5" />
      <path d="M6.25 9.5v4.5a3 3 0 0 0 3 3h5.25" />
    </svg>
  );
}

// 3. Step 3: Verification outcome icon (Clipboard with checkmark)
function ClipboardCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

// 4. Step 4: Summary scroll document icon
function ScrollSummaryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
      <path d="M11 8h4" />
      <path d="M11 12h4" />
    </svg>
  );
}

// Chevron separator between steps
function ChevronSeparator({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-4 h-4 shrink-0 text-zinc-600 select-none", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function getDefaultStepIcon(index: number) {
  switch (index) {
    case 0:
      return <ChecklistIcon />;
    case 1:
      return <WorkflowNodesIcon />;
    case 2:
      return <ClipboardCheckIcon />;
    case 3:
      return <ScrollSummaryIcon />;
    default:
      return <ChecklistIcon />;
  }
}

export function Stepper({
  steps,
  activeStep,
  onStepClick,
  allowClickCompleted = true,
  className,
  ...props
}: StepperProps) {
  const activeIndex = React.useMemo(() => {
    if (typeof activeStep === "number") return activeStep;
    return steps.findIndex((s) => s.id === activeStep);
  }, [activeStep, steps]);

  return (
    <nav
      aria-label="Progress Stepper"
      className={cn(
        "w-full bg-[#0c0d0e] border border-zinc-800/80 rounded-2xl p-3 sm:p-4 overflow-x-auto no-scrollbar select-none shadow-md",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between min-w-max md:min-w-0 w-full gap-2 sm:gap-4 md:gap-6">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isPending = index > activeIndex;

          const isClickable =
            !step.disabled &&
            ((isCompleted && allowClickCompleted) ||
              (isCurrent && Boolean(onStepClick)));

          const stepIcon = step.icon ?? getDefaultStepIcon(index);
          const subtitleText = step.desc || `Step ${index + 1}`;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step, index)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 text-left transition-all duration-150 outline-none rounded-xl p-1.5 -m-1.5",
                  isClickable && "cursor-pointer hover:opacity-90 active:scale-[0.98]",
                  !isClickable && "cursor-default"
                )}
              >
                {/* Step Icon Badge */}
                <div
                  className={cn(
                    "h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    isCompleted &&
                      "bg-[#00c067] text-white shadow-sm shadow-[#00c067]/25",
                    isCurrent &&
                      "bg-zinc-800/90 border border-zinc-700/90 text-white shadow-sm ring-1 ring-zinc-600/40",
                    isPending &&
                      "bg-zinc-900/60 border border-zinc-800/80 text-zinc-500"
                  )}
                >
                  {stepIcon}
                </div>

                {/* Step Label & Subtitle */}
                <div className="flex flex-col min-w-0">
                  <span
                    className={cn(
                      "text-sm font-semibold tracking-tight truncate leading-tight",
                      isCompleted && "text-white",
                      isCurrent && "text-white font-semibold",
                      isPending && "text-zinc-400 font-medium"
                    )}
                  >
                    {step.label}
                  </span>
                  <span
                    className={cn(
                      "text-xs mt-1 leading-none font-normal",
                      isCompleted && "text-zinc-400",
                      isCurrent && "text-zinc-400",
                      isPending && "text-zinc-500/80"
                    )}
                  >
                    {subtitleText}
                  </span>
                </div>
              </button>

              {/* Separator Chevron between steps */}
              {index < steps.length - 1 && (
                <ChevronSeparator className="mx-1 sm:mx-2 text-zinc-600" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
