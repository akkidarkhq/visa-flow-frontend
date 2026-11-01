"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getApplicationByIdApi } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import {
  VisaApplicationResponse,
  VisaApplicationSummary,
  ApplicationStatus,
  ApiError,
  GroupTraveller,
} from "@/lib/api/types";

interface ApplicationDetailsModalProps {
  applicationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  initialSummary?: VisaApplicationSummary | null;
}

// Status badge helper matching dashboard styling
function getStatusBadge(status?: ApplicationStatus) {
  if (!status) {
    return {
      label: "Unknown",
      className: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
    };
  }
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
        label: status,
        className: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
      };
  }
}

function formatDate(isoString?: string) {
  if (!isoString) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function ApplicationDetailsModal({
  applicationId,
  isOpen,
  onClose,
  initialSummary,
}: ApplicationDetailsModalProps) {
  const [details, setDetails] = useState<VisaApplicationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch full application details from backend
  const fetchDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await getApplicationByIdApi(id);
      if (res.success && res.data) {
        setDetails(res.data);
      } else {
        throw new Error(res.message || "Failed to fetch application details.");
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setApiError(err.apiError);
      } else {
        setApiError({
          message: err instanceof Error ? err.message : "Error loading details.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchDetails(applicationId);
    } else {
      setDetails(null);
      setApiError(null);
    }
  }, [isOpen, applicationId, fetchDetails]);

  // Lock body scroll and handle Escape key
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

  if (!isOpen) return null;

  // Active data to display (prefer full fetched details, fallback to initial summary)
  const activeData: Partial<VisaApplicationResponse> =
    (details || initialSummary || {}) as Partial<VisaApplicationResponse>;
  const status = details?.status || initialSummary?.status;
  const badge = getStatusBadge(status);

  const handleCopyId = () => {
    const idToCopy = details?.id || applicationId || "";
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Known fields to omit from generic extra-fields display
  const knownKeys = new Set([
    "id",
    "orderReference",
    "groupReference",
    "countryName",
    "countryCode",
    "visaType",
    "applicantName",
    "status",
    "userId",
    "passportNumber",
    "passportExpiry",
    "nationality",
    "gender",
    "dateOfBirth",
    "travelDate",
    "returnDate",
    "submittedAt",
    "createdAt",
    "updatedAt",
    "fee",
    "totalAmount",
    "currency",
    "notes",
    "remarks",
    "documents",
    "documentsSummary",
    "travellers",
    "paid",
  ]);

  const extraEntries = Object.entries(activeData).filter(
    ([key, value]) =>
      !knownKeys.has(key) &&
      value !== null &&
      value !== undefined &&
      typeof value !== "object"
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Content Container */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-foreground">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2
                id="application-details-title"
                className="text-xl font-bold tracking-tight text-foreground"
              >
                Visa Application Details
              </h2>
              {status && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}
                >
                  {badge.label}
                </span>
              )}
              {activeData.groupReference && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Group: {activeData.groupReference}
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              Reference: <span className="font-semibold text-foreground">{activeData.orderReference || applicationId}</span>
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
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl border border-border/80 bg-muted/20 text-muted-foreground text-sm animate-pulse">
              <svg
                className="animate-spin h-5 w-5 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Fetching complete application details from server...</span>
            </div>
          )}

          {/* API Error Notification */}
          {apiError && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-destructive/15 text-destructive border border-destructive/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-sm">
                  {apiError.code ? `Error: [${apiError.code}]` : "Failed to load live details"}
                </p>
                <p className="text-xs mt-0.5">{apiError.message}</p>
                {initialSummary && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Displaying cached application information below.
                  </p>
                )}
              </div>
              {applicationId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDetails(applicationId)}
                  className="w-fit shrink-0"
                >
                  Retry
                </Button>
              )}
            </div>
          )}

          {/* Section: Primary Information Grid */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Core Application Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Applicant Name
                </span>
                <p className="text-sm font-semibold">{activeData.applicantName || "—"}</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Destination Country
                </span>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{activeData.countryName || "—"}</p>
                  {activeData.countryCode && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {activeData.countryCode}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Visa Category / Type
                </span>
                <p className="text-sm font-semibold">{activeData.visaType || "—"}</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Order / App Reference
                </span>
                <p className="text-sm font-mono font-semibold">
                  {activeData.orderReference || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Current Status
                </span>
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Application UUID
                </span>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-mono truncate" title={activeData.id || applicationId || ""}>
                    {activeData.id || applicationId || "—"}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="text-xs text-muted-foreground hover:text-foreground shrink-0 p-1"
                    title="Copy UUID"
                  >
                    {copied ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-sans text-[10px] font-semibold">
                        Copied!
                      </span>
                    ) : (
                      <svg
                        className="h-3.5 w-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section: Applicant & Passport Details (if available) */}
          {(activeData.passportNumber ||
            activeData.passportExpiry ||
            activeData.nationality ||
            activeData.dateOfBirth ||
            activeData.gender ||
            activeData.travelDate ||
            activeData.returnDate ||
            activeData.totalAmount ||
            activeData.fee) && (
            <>
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Applicant & Travel Specifics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {activeData.passportNumber && (
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Passport Number
                      </span>
                      <p className="text-sm font-mono font-semibold">
                        {String(activeData.passportNumber)}
                      </p>
                    </div>
                  )}

                  {activeData.passportExpiry && (
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Passport Expiry
                      </span>
                      <p className="text-sm font-semibold">{formatDate(activeData.passportExpiry)}</p>
                    </div>
                  )}

                  {activeData.nationality && (
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Nationality
                      </span>
                      <p className="text-sm font-semibold">{String(activeData.nationality)}</p>
                    </div>
                  )}

                  {activeData.gender && (
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Gender
                      </span>
                      <p className="text-sm font-semibold">{String(activeData.gender)}</p>
                    </div>
                  )}

                  {activeData.dateOfBirth && (
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date of Birth
                      </span>
                      <p className="text-sm font-semibold">{formatDate(activeData.dateOfBirth)}</p>
                    </div>
                  )}

                  {activeData.travelDate && (
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Intended Travel Date
                      </span>
                      <p className="text-sm font-semibold">{formatDate(activeData.travelDate)}</p>
                    </div>
                  )}

                  {activeData.returnDate && (
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Return Date
                      </span>
                      <p className="text-sm font-semibold">{formatDate(activeData.returnDate)}</p>
                    </div>
                  )}

                  {(activeData.totalAmount || activeData.fee) && (
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Fee / Amount
                      </span>
                      <p className="text-sm font-semibold">
                        {activeData.currency ? `${activeData.currency} ` : "$"}
                        {String(activeData.totalAmount || activeData.fee)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Section: Travellers (if multiple travellers returned) */}
          {activeData.travellers && activeData.travellers.length > 0 && (
            <>
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Travellers ({activeData.travellers.length})
                </h3>
                <div className="space-y-2.5">
                  {activeData.travellers.map((tr: GroupTraveller, idx: number) => {
                    const trBadge = getStatusBadge(tr.status);
                    return (
                      <div
                        key={tr.applicationId || idx}
                        className="rounded-xl border border-border bg-muted/15 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm">
                              {tr.fullName}
                            </div>
                            <div className="text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span>Ref: {tr.referenceNumber}</span>
                              {tr.passportNumber && <span>&bull; Passport: {tr.passportNumber}</span>}
                              {tr.nationality && <span>&bull; {tr.nationality}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${trBadge.className}`}
                          >
                            {trBadge.label}
                          </span>
                          {tr.paid !== undefined && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                tr.paid
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                              }`}
                            >
                              {tr.paid ? "Paid" : "Unpaid"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Section: Timeline & Timestamps */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Application History & Timestamps
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created At
                </span>
                <p className="text-sm font-semibold">{formatDate(activeData.createdAt)}</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Submitted At
                </span>
                <p className="text-sm font-semibold">{formatDate(activeData.submittedAt)}</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Updated
                </span>
                <p className="text-sm font-semibold">{formatDate(activeData.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Section: Documents (if any) */}
          {activeData.documents && activeData.documents.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Associated Documents ({activeData.documents.length})
                </h3>
                <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                  {activeData.documents.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="p-3.5 flex items-center justify-between gap-4 bg-muted/10 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <svg
                            className="h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {doc.name || doc.fileName || doc.documentType || `Document #${idx + 1}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.documentType || "Uploaded Document"}{" "}
                            {doc.uploadedAt ? `\u2022 ${formatDate(doc.uploadedAt)}` : ""}
                          </p>
                        </div>
                      </div>

                      {doc.status && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border">
                          {doc.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Section: Notes or Remarks (if present) */}
          {(activeData.notes || activeData.remarks) && (
            <>
              <Separator />
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-1.5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Remarks / Notes
                </h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {String(activeData.remarks || activeData.notes)}
                </p>
              </div>
            </>
          )}

          {/* Section: Dynamic Extra Fields from Backend (if any) */}
          {extraEntries.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {extraEntries.map(([key, val]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1"
                    >
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <p className="text-sm font-semibold truncate" title={String(val)}>
                        {String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applicationId && fetchDetails(applicationId)}
            disabled={isLoading || !applicationId}
          >
            Refresh Data
          </Button>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
