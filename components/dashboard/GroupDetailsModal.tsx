"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  GroupApplicationResponse,
  GroupTraveller,
  ApplicationStatus,
} from "@/lib/api/types";

interface GroupDetailsModalProps {
  group: GroupApplicationResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndividualTraveller?: (traveller: GroupTraveller) => void;
}

// Status badge styling helper
function getStatusBadge(status?: ApplicationStatus) {
  switch (status) {
    case "APPLICATION_STARTED":
      return {
        label: "Started",
        className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
      };
    case "DOCUMENTS_PENDING":
      return {
        label: "Docs Pending",
        className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
      };
    case "DOCUMENTS_UNDER_REVIEW":
      return {
        label: "Under Review",
        className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
      };
    case "DOCUMENTS_COMPLETE":
      return {
        label: "Docs Verified",
        className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300",
      };
    case "SUBMITTED":
      return {
        label: "Submitted",
        className: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300",
      };
    case "EMBASSY_CONSULATE_PROCESSING":
      return {
        label: "Embassy Processing",
        className: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300",
      };
    case "PASSPORT_DECISION_RECEIVED":
      return {
        label: "Decision Received",
        className: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300",
      };
    case "COMPLETED":
      return {
        label: "Completed",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
      };
    default:
      return {
        label: status || "Unknown",
        className: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
      };
  }
}

function formatDate(isoString?: string) {
  if (!isoString) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function GroupDetailsModal({
  group,
  isOpen,
  onClose,
  onSelectIndividualTraveller,
}: GroupDetailsModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedTravellerIndex, setSelectedTravellerIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !group) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const currencySymbol = group.currency === "INR" ? "₹" : group.currency || "$";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Content Container */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-foreground">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                Group Application
              </span>
              <h2
                id="group-details-title"
                className="text-xl font-bold tracking-tight text-foreground"
              >
                {group.groupReference}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border">
                {group.totalTravellers} {group.totalTravellers === 1 ? "Traveller" : "Travellers"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {group.countryName} &bull; {group.visaTypeName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close modal"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cost & Fee Breakdown Summary */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cost & Fee Breakdown ({group.currency || "INR"})
              </h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                  group.readyForCheckout
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {group.readyForCheckout ? "Ready For Checkout" : "Pending Documentation / Checkout"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-card border border-border space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase">
                  Service Fee
                </span>
                <p className="text-base font-semibold">
                  {currencySymbol}
                  {group.serviceFee?.toLocaleString() ?? "0"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase">
                  Embassy Fee
                </span>
                <p className="text-base font-semibold">
                  {currencySymbol}
                  {group.embassyFee?.toLocaleString() ?? "0"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase">
                  Fee Per Person
                </span>
                <p className="text-base font-semibold">
                  {currencySymbol}
                  {group.feePerPerson?.toLocaleString() ?? "0"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-card border border-primary/30 bg-primary/5 space-y-0.5">
                <span className="text-[11px] font-medium text-primary uppercase">
                  Total Estimated
                </span>
                <p className="text-base font-bold text-primary">
                  {currencySymbol}
                  {group.totalEstimatedCost?.toLocaleString() ?? "0"}
                </p>
              </div>
            </div>
          </div>

          {/* Section: Travellers in this Group */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Traveller Applications ({group.travellers?.length || 0})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Individual visa applications tracked under this group reference.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {group.travellers?.map((traveller, index) => {
                const badge = getStatusBadge(traveller.status);
                const isExpanded = selectedTravellerIndex === index;
                const docSum = traveller.documentsSummary;

                return (
                  <div
                    key={traveller.applicationId || index}
                    className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:border-border/80 transition-colors"
                  >
                    {/* Traveller Row Header */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{traveller.fullName}</span>
                            {traveller.gender && (
                              <span className="text-[11px] text-muted-foreground">
                                &bull; {traveller.gender}
                              </span>
                            )}
                            {traveller.nationality && (
                              <span className="text-[11px] text-muted-foreground">
                                &bull; {traveller.nationality}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-mono">
                            <span>Ref: {traveller.referenceNumber}</span>
                            <span>&bull;</span>
                            <span>Passport: {traveller.passportNumber || "—"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            traveller.paid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {traveller.paid ? "Paid" : "Unpaid"}
                        </span>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setSelectedTravellerIndex(isExpanded ? null : index)}
                        >
                          {isExpanded ? "Hide Details" : "Details"}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Traveller Details */}
                    {isExpanded && (
                      <div className="p-4 border-t border-border space-y-4 text-xs animate-in slide-in-from-top-2 duration-150">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-2.5 rounded-lg bg-muted/30 space-y-0.5">
                            <span className="text-[10px] font-medium uppercase text-muted-foreground">
                              Date of Birth
                            </span>
                            <p className="font-semibold">{formatDate(traveller.dateOfBirth)}</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-muted/30 space-y-0.5">
                            <span className="text-[10px] font-medium uppercase text-muted-foreground">
                              Passport Expiry
                            </span>
                            <p className="font-semibold">{formatDate(traveller.passportExpiry)}</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-muted/30 space-y-0.5">
                            <span className="text-[10px] font-medium uppercase text-muted-foreground">
                              Created On
                            </span>
                            <p className="font-semibold">{formatDate(traveller.createdAt)}</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-muted/30 space-y-0.5">
                            <span className="text-[10px] font-medium uppercase text-muted-foreground">
                              Application UUID
                            </span>
                            <div className="flex items-center justify-between gap-1 font-mono">
                              <p className="truncate" title={traveller.applicationId}>
                                {traveller.applicationId}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopy(traveller.applicationId, traveller.applicationId)}
                                className="text-muted-foreground hover:text-foreground shrink-0"
                                title="Copy UUID"
                              >
                                {copied === traveller.applicationId ? "✓" : "📋"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Documents Summary */}
                        {docSum && (
                          <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-2">
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                              Documentation Checklist Status
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                              <div className="p-2 rounded bg-card border border-border">
                                <span className="text-[10px] text-muted-foreground block">Required</span>
                                <span className="font-bold text-sm">{docSum.totalMandatoryRequired ?? 0}</span>
                              </div>
                              <div className="p-2 rounded bg-card border border-border">
                                <span className="text-[10px] text-muted-foreground block">Uploaded</span>
                                <span className="font-bold text-sm text-blue-600">{docSum.totalUploaded ?? 0}</span>
                              </div>
                              <div className="p-2 rounded bg-card border border-border">
                                <span className="text-[10px] text-muted-foreground block">Approved</span>
                                <span className="font-bold text-sm text-emerald-600">{docSum.totalApproved ?? 0}</span>
                              </div>
                              <div className="p-2 rounded bg-card border border-border">
                                <span className="text-[10px] text-muted-foreground block">Under Review</span>
                                <span className="font-bold text-sm text-purple-600">{docSum.totalUnderReview ?? 0}</span>
                              </div>
                              <div className="p-2 rounded bg-card border border-border">
                                <span className="text-[10px] text-muted-foreground block">Correction</span>
                                <span className="font-bold text-sm text-amber-600">{docSum.totalCorrectionRequested ?? 0}</span>
                              </div>
                              <div className="p-2 rounded bg-card border border-border">
                                <span className="text-[10px] text-muted-foreground block">Rejected</span>
                                <span className="font-bold text-sm text-red-600">{docSum.totalRejected ?? 0}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {onSelectIndividualTraveller && (
                          <div className="flex justify-end pt-1">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => onSelectIndividualTraveller(traveller)}
                            >
                              View Complete Application (#{traveller.referenceNumber}) &rarr;
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Group Reference: <span className="font-mono font-semibold text-foreground">{group.groupReference}</span>
          </p>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
