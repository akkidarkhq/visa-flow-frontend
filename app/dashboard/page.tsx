"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/Navbar";
import {
  getUserProfileApi,
  getUserApplicationsApi,
  getUserGroupApplicationsApi,
  getCurrentUser,
} from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import {
  ApiError,
  User,
  VisaApplicationSummary,
  GroupApplicationResponse,
  GroupTraveller,
  ApplicationStatus,
} from "@/lib/api/types";
import { ApplicationDetailsModal } from "@/components/dashboard/ApplicationDetailsModal";
import { GroupDetailsModal } from "@/components/dashboard/GroupDetailsModal";

// Status badge color and label mapping
function getStatusBadge(status: ApplicationStatus) {
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

export default function ClientDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<VisaApplicationSummary[]>([]);
  const [groups, setGroups] = useState<GroupApplicationResponse[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "GROUPS" | "INDIVIDUALS">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [, startTransition] = useTransition();

  // Modal states for Individual Application
  const [selectedApplication, setSelectedApplication] = useState<VisaApplicationSummary | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Modal states for Group Application
  const [selectedGroup, setSelectedGroup] = useState<GroupApplicationResponse | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setApiError(null);
    let userId = "";
    // Initial check from browser cache for instant rendering
    const cachedUser = getCurrentUser();
    if (cachedUser) {
      setUser(cachedUser);
      userId = cachedUser?.id ?? "";
    }

    try {
      // 1. Fetch user profile from backend
      const userRes = await getUserProfileApi();
      if (userRes.success && userRes.data) {
        setUser(userRes.data);
        userId = userRes.data.id;
      }

      // 2. Fetch individual visa applications
      try {
        const appRes = await getUserApplicationsApi(userId);
        if (appRes.success && appRes.data) {
          setApplications(appRes.data);
        }
      } catch {
        // Fallback demo individual applications
        setApplications([
          {
            id: "app-84930-fr",
            orderReference: "ORD-2026-8812",
            countryName: "France (Schengen)",
            countryCode: "FR",
            visaType: "Tourist Visa (Short Stay)",
            travellerFullName: userRes.data?.fullName || "Akshay Sharma",
            status: "DOCUMENTS_UNDER_REVIEW",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "app-39201-uk",
            orderReference: "ORD-2026-9041",
            countryName: "United Kingdom",
            countryCode: "GB",
            visaType: "Standard Visitor Visa",
            travellerFullName: userRes.data?.fullName || "Akshay Sharma",
            status: "EMBASSY_CONSULATE_PROCESSING",
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
        ]);
      }

      // 3. Fetch group visa applications (GET /applications/groups/user/{userId})
      try {
        const groupRes = await getUserGroupApplicationsApi(userId);
        if (groupRes.success && groupRes.data) {
          const groupList = Array.isArray(groupRes.data) ? groupRes.data : [groupRes.data];
          setGroups(groupList);
        }
      } catch {
        // Fallback demo group applications matching backend structure
        setGroups([
          {
            groupReference: "GRP-2026-983221",
            visaTypeId: 1,
            visaTypeName: "30-Day Single Entry Tourist e-Visa",
            countryName: "United Arab Emirates",
            serviceFee: 1200.0,
            embassyFee: 6300.0,
            feePerPerson: 7500.0,
            totalEstimatedCost: 30000.0,
            currency: "INR",
            totalTravellers: 4,
            travellers: [
              {
                applicationId: "bd546cf3-0227-4a56-abea-6f84993dfb93",
                referenceNumber: "VF-2026-853679",
                status: "APPLICATION_STARTED",
                createdAt: "2026-10-13T20:39:02.45407Z",
                travellerId: "eacb647c-0354-407e-8d05-494ad04517cf",
                firstName: "Carlos",
                lastName: "Rodriguez",
                fullName: "Carlos Rodriguez",
                passportNumber: "P7654321",
                passportExpiry: "2030-05-10",
                dateOfBirth: "1985-04-15",
                nationality: "Spanish",
                gender: "Male",
                orderItemId: null,
                orderReference: null,
                documentsSummary: {
                  totalMandatoryRequired: 0,
                  totalUploaded: 0,
                  totalApproved: 0,
                  totalUnderReview: 0,
                  totalCorrectionRequested: 0,
                  totalRejected: 0,
                },
                paid: false,
              },
              {
                applicationId: "914528be-2420-4815-8d8c-1a0b61701bcb",
                referenceNumber: "VF-2026-618263",
                status: "APPLICATION_STARTED",
                createdAt: "2026-10-13T20:39:02.475773Z",
                travellerId: "184d0b21-ad26-42a6-a5c9-129204d56d2d",
                firstName: "Maria",
                lastName: "Garcia",
                fullName: "Maria Garcia",
                passportNumber: "P1928374",
                passportExpiry: "2027-03-20",
                dateOfBirth: "1962-07-30",
                nationality: "Spanish",
                gender: "Female",
                orderItemId: null,
                orderReference: null,
                documentsSummary: {
                  totalMandatoryRequired: 0,
                  totalUploaded: 0,
                  totalApproved: 0,
                  totalUnderReview: 0,
                  totalCorrectionRequested: 0,
                  totalRejected: 0,
                },
                paid: false,
              },
              {
                applicationId: "d7cec77f-df83-42c5-acea-5b0cc25036fa",
                referenceNumber: "VF-2026-532462",
                status: "APPLICATION_STARTED",
                createdAt: "2026-10-13T20:39:02.479824Z",
                travellerId: "65cbdbc7-7ae2-4fe0-9c01-73528e370cc2",
                firstName: "Mateo",
                lastName: "Rodriguez",
                fullName: "Mateo Rodriguez",
                passportNumber: "P9876543",
                passportExpiry: "2028-12-01",
                dateOfBirth: "2015-09-08",
                nationality: "Spanish",
                gender: "Male",
                orderItemId: null,
                orderReference: null,
                documentsSummary: {
                  totalMandatoryRequired: 0,
                  totalUploaded: 0,
                  totalApproved: 0,
                  totalUnderReview: 0,
                  totalCorrectionRequested: 0,
                  totalRejected: 0,
                },
                paid: false,
              },
              {
                applicationId: "ee8409f6-9bbe-442a-9d00-3af3d1d71842",
                referenceNumber: "VF-2026-625931",
                status: "APPLICATION_STARTED",
                createdAt: "2026-10-13T20:39:02.483923Z",
                travellerId: "790bac50-674a-4374-b151-10026d386a2f",
                firstName: "Elena",
                lastName: "Rodriguez",
                fullName: "Elena Rodriguez",
                passportNumber: "P1234567",
                passportExpiry: "2029-08-14",
                dateOfBirth: "1988-11-22",
                nationality: "Spanish",
                gender: "Female",
                orderItemId: null,
                orderReference: null,
                documentsSummary: {
                  totalMandatoryRequired: 0,
                  totalUploaded: 0,
                  totalApproved: 0,
                  totalUnderReview: 0,
                  totalCorrectionRequested: 0,
                  totalRejected: 0,
                },
                paid: false,
              },
            ],
            readyForCheckout: false,
          },
        ]);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setApiError(err.apiError);
      } else {
        setApiError({
          message: err instanceof Error ? err.message : "Failed to load client details.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Open individual application details modal
  const handleViewDetails = (app: VisaApplicationSummary) => {
    setSelectedApplication(app);
    setIsDetailsModalOpen(true);
  };

  // Open group application details modal
  const handleViewGroup = (group: GroupApplicationResponse) => {
    setSelectedGroup(group);
    setIsGroupModalOpen(true);
  };

  // Drilldown from group to an individual traveller's full application
  const handleSelectTravellerFromGroup = (traveller: GroupTraveller) => {
    setSelectedApplication({
      id: traveller.applicationId,
      orderReference: traveller.referenceNumber,
      countryName: selectedGroup?.countryName || "Destination",
      countryCode: selectedGroup?.countryCode || "",
      visaType: selectedGroup?.visaTypeName || "Visa Application",
      travellerFullName: traveller.fullName,
      status: traveller.status,
      groupReference: selectedGroup?.groupReference,
      updatedAt: traveller.createdAt,
    });
    setIsDetailsModalOpen(true);
  };

  // Helper date formatter
  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  // Computed metrics across individual & group records
  const totalGroupTravellers = groups.reduce((acc, g) => acc + (g.totalTravellers || g.travellers?.length || 0), 0);
  const totalActiveCases = applications.length + totalGroupTravellers;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground pb-20">
      {/* Dynamic Primary Navbar */}
      <Navbar user={user} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* API Error Notification */}
        {apiError && (
          <div
            role="alert"
            className="p-4 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div>
              <p className="font-semibold text-sm">
                {apiError.code ? `Error: [${apiError.code}]` : "API Error"}
              </p>
              <p className="text-sm">{apiError.message}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              className="w-fit"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && !user ? (
          <div className="grid gap-6">
            <div className="h-36 rounded-xl border border-border bg-card animate-pulse p-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-28 rounded-xl border border-border bg-card animate-pulse" />
              <div className="h-28 rounded-xl border border-border bg-card animate-pulse" />
              <div className="h-28 rounded-xl border border-border bg-card animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {/* Header / Welcome Card */}
            <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-2xl font-bold tracking-tight">
                      Welcome back, {user?.fullName || "Client"}
                    </h2>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                        user?.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {user?.isActive ? "Active Account" : "Inactive"}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border">
                      {user?.role || "CLIENT"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage your individual and group visa applications, documents, and traveller records.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link href="/dashboard/new-application">
                    <Button className="font-medium shadow-sm">
                      + New Visa Application
                    </Button>
                  </Link>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Client Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold">{user?.fullName || "—"}</p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Username
                  </p>
                  <p className="text-sm font-semibold font-mono">
                    @{user?.username || "—"}
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-sm font-semibold truncate" title={user?.email}>
                    {user?.email || "—"}
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Phone Number
                  </p>
                  <p className="text-sm font-semibold">{user?.phoneNumber || "—"}</p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Client UUID
                  </p>
                  <p className="text-xs font-mono truncate" title={user?.id}>
                    {user?.id || "—"}
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </p>
                  <p className="text-sm font-semibold">{user?.role || "CLIENT"}</p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Registered On
                  </p>
                  <p className="text-sm font-semibold">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Last Updated
                  </p>
                  <p className="text-sm font-semibold">
                    {formatDate(user?.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Total Travellers / Visas</p>
                <div className="text-2xl font-bold">{totalActiveCases}</div>
                <p className="text-xs text-muted-foreground">
                  {applications.length} individual &bull; {totalGroupTravellers} in {groups.length} {groups.length === 1 ? "group" : "groups"}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Active Group Applications</p>
                <div className="text-2xl font-bold text-primary">
                  {groups.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalGroupTravellers} travellers across groups
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Under Review</p>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {applications.filter((a) => a.status === "DOCUMENTS_UNDER_REVIEW").length}
                </div>
                <p className="text-xs text-muted-foreground">Verified by visa team</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Completed Visas</p>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {applications.filter((a) => a.status === "COMPLETED").length}
                </div>
                <p className="text-xs text-muted-foreground">Ready for travel</p>
              </div>
            </div>

            {/* Application View Filter Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("ALL")}
                >
                  All Applications ({applications.length + groups.length})
                </Button>
                <Button
                  variant={activeTab === "GROUPS" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("GROUPS")}
                >
                  Group Applications ({groups.length})
                </Button>
                <Button
                  variant={activeTab === "INDIVIDUALS" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("INDIVIDUALS")}
                >
                  Individual Applications ({applications.length})
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                Refresh Data
              </Button>
            </div>

            {/* SECTION 1: Group Visa Applications */}
            {(activeTab === "ALL" || activeTab === "GROUPS") && (
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden space-y-0">
                <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-semibold tracking-tight">
                        Group Visa Applications
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                        {groups.length} {groups.length === 1 ? "Group" : "Groups"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Batch applications containing multiple travellers created together.
                    </p>
                  </div>
                </div>

                {groups.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No group visa applications found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40 text-xs uppercase font-medium text-muted-foreground border-b border-border">
                        <tr>
                          <th className="py-3 px-6">Group Ref</th>
                          <th className="py-3 px-6">Destination & Visa</th>
                          <th className="py-3 px-6">Travellers</th>
                          <th className="py-3 px-6">Estimated Cost</th>
                          <th className="py-3 px-6">Checkout Status</th>
                          <th className="py-3 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {groups.map((group) => {
                          const currencySym = group.currency === "INR" ? "₹" : group.currency || "$";
                          const travellerNames = group.travellers?.map((t) => t.fullName).join(", ") || "";

                          return (
                            <tr key={group.groupReference} className="hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-6 font-mono text-xs font-semibold">
                                <span className="bg-muted px-2 py-1 rounded border border-border">
                                  {group.groupReference}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-medium text-foreground">
                                  {group.countryName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {group.visaTypeName}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-sm">
                                    {group.totalTravellers} {group.totalTravellers === 1 ? "Person" : "Persons"}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate max-w-xs" title={travellerNames}>
                                  {travellerNames}
                                </p>
                              </td>
                              <td className="py-4 px-6 font-semibold">
                                {currencySym}
                                {group.totalEstimatedCost?.toLocaleString() ?? "—"}
                                <span className="text-[11px] text-muted-foreground block font-normal">
                                  ({currencySym}{group.feePerPerson?.toLocaleString() ?? "—"}/person)
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    group.readyForCheckout
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                                  }`}
                                >
                                  {group.readyForCheckout ? "Ready to Checkout" : "Pending Documents"}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewGroup(group)}
                                >
                                  View Group ({group.totalTravellers})
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: Individual Visa Applications */}
            {(activeTab === "ALL" || activeTab === "INDIVIDUALS") && (
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden space-y-0">
                <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-semibold tracking-tight">
                        Individual Visa Applications
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border">
                        {applications.length} {applications.length === 1 ? "Application" : "Applications"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Direct individual visa cases associated with this account.
                    </p>
                  </div>
                </div>

                {applications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No individual visa applications found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40 text-xs uppercase font-medium text-muted-foreground border-b border-border">
                        <tr>
                          <th className="py-3 px-6">Order Ref</th>
                          <th className="py-3 px-6">Destination & Visa</th>
                          <th className="py-3 px-6">Applicant</th>
                          <th className="py-3 px-6">Status</th>
                          <th className="py-3 px-6">Updated At</th>
                          <th className="py-3 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {applications.map((app) => {
                          const badge = getStatusBadge(app.status);
                          return (
                            <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-6 font-mono text-xs font-semibold">
                                {app.orderReference}
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-medium text-foreground">
                                  {app.countryName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {app.visaType}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm">{app.travellerFullName}</td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-xs text-muted-foreground">
                                {formatDate(app.updatedAt)}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(app)}
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Individual Details Modal */}
      <ApplicationDetailsModal
        isOpen={isDetailsModalOpen}
        applicationId={selectedApplication?.id || null}
        initialSummary={selectedApplication}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedApplication(null);
        }}
      />

      {/* Group Details Modal */}
      <GroupDetailsModal
        isOpen={isGroupModalOpen}
        group={selectedGroup}
        onClose={() => {
          setIsGroupModalOpen(false);
          setSelectedGroup(null);
        }}
        onSelectIndividualTraveller={handleSelectTravellerFromGroup}
      />
    </div>
  );
}
