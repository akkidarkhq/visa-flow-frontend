"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Stepper, StepItem } from "@/components/ui/stepper";
import { Navbar } from "@/components/layout/Navbar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { getCurrentUser, getUserProfileApi } from "@/lib/api/auth";
import {
  getCountriesApi,
  getVisaTypesByCountryApi,
  getUserTravellersApi,
  createTravellerApi,
  createSingleApplicationApi,
  createGroupApplicationApi,
} from "@/lib/api/applications";
import { ApiClientError } from "@/lib/api/client";
import {
  CountryResponse,
  VisaTypeResponse,
  TravellerResponseDto,
  User,
  VisaApplicationResponse,
} from "@/lib/api/types";

// Step enumeration
type Step = "DESTINATION" | "MODE" | "TRAVELLERS" | "REVIEW" | "SUCCESS";

const APPLICATION_STEPS: StepItem[] = [
  { id: "DESTINATION", label: "Destination", desc: "Step 1" },
  { id: "MODE", label: "Application Type", desc: "Step 2" },
  { id: "TRAVELLERS", label: "Travellers", desc: "Step 3" },
  { id: "REVIEW", label: "Review & Submit", desc: "Step 4" },
];

interface NewTravellerFormData {
  id?: string; // If selecting existing
  firstName: string;
  lastName: string;
  passportNumber: string;
  passportExpiry: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  isExisting?: boolean;
}

const emptyTravellerForm: NewTravellerFormData = {
  firstName: "",
  lastName: "",
  passportNumber: "",
  passportExpiry: "",
  dateOfBirth: "",
  nationality: "Indian",
  gender: "Male",
};

export default function NewApplicationPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Wizard step
  const [currentStep, setCurrentStep] = useState<Step>("DESTINATION");

  // Selection states
  const [countries, setCountries] = useState<CountryResponse[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryResponse | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [visaTypes, setVisaTypes] = useState<VisaTypeResponse[]>([]);
  const [selectedVisaType, setSelectedVisaType] = useState<VisaTypeResponse | null>(null);

  // Collapsible accordion states for Step 1
  const [isCountryOpen, setIsCountryOpen] = useState(true);
  const [isVisaTypeOpen, setIsVisaTypeOpen] = useState(false);

  // Mode: "INDIVIDUAL" or "GROUP"
  const [applicationMode, setApplicationMode] = useState<"INDIVIDUAL" | "GROUP">("INDIVIDUAL");

  // Saved travellers from backend
  const [savedTravellers, setSavedTravellers] = useState<TravellerResponseDto[]>([]);

  // Current list of applicants for this application
  const [applicants, setApplicants] = useState<NewTravellerFormData[]>([
    { ...emptyTravellerForm },
  ]);

  // UI status states
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingVisaTypes, setLoadingVisaTypes] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    groupReference?: string;
    applications: VisaApplicationResponse[];
  } | null>(null);

  // Reset all application form fields back to zero/initial defaults
  const handleResetApplication = () => {
    setCurrentStep("DESTINATION");
    setSelectedCountry(null);
    setSelectedVisaType(null);
    setCountrySearch("");
    setVisaTypes([]);
    setIsCountryOpen(true);
    setIsVisaTypeOpen(false);
    setApplicationMode("INDIVIDUAL");
    setApplicants([{ ...emptyTravellerForm }]);
    setErrorMessage(null);
    setSuccessData(null);
  };

  // Cancel and return to dashboard, resetting filled application data to zero
  const handleCancelAndExit = () => {
    handleResetApplication();
    router.push("/dashboard");
  };

  // Initial load: User, Countries, and Saved Travellers
  useEffect(() => {
    async function initData() {
      setLoadingInitial(true);
      setErrorMessage(null);

      let user = getCurrentUser();
      if (!user) {
        try {
          const userRes = await getUserProfileApi();
          if (userRes.success && userRes.data) {
            user = userRes.data;
          }
        } catch {
          // If unauthenticated, user might be null
        }
      }
      setCurrentUser(user);

      // Load countries
      try {
        const countryRes = await getCountriesApi();
        if (countryRes.success && countryRes.data && countryRes.data.length > 0) {
          setCountries(countryRes.data.filter((c) => c.isActive !== false));
        } else {
          // Fallback demo countries matching backend seed
          setCountries([
            { id: 1, name: "France (Schengen)", isoCode: "FR", isActive: true },
            { id: 2, name: "United Arab Emirates", isoCode: "AE", isActive: true },
            { id: 3, name: "United Kingdom", isoCode: "GB", isActive: true },
            { id: 4, name: "Singapore", isoCode: "SG", isActive: true },
            { id: 5, name: "United States", isoCode: "US", isActive: true },
            { id: 6, name: "Germany (Schengen)", isoCode: "DE", isActive: true },
            { id: 7, name: "Canada", isoCode: "CA", isActive: true },
            { id: 8, name: "Australia", isoCode: "AU", isActive: true },
            { id: 9, name: "Switzerland (Schengen)", isoCode: "CH", isActive: true },
            { id: 10, name: "Japan", isoCode: "JP", isActive: true },
            { id: 11, name: "Thailand", isoCode: "TH", isActive: true },
            { id: 12, name: "Italy (Schengen)", isoCode: "IT", isActive: true },
          ]);
        }
      } catch {
        // Fallback demo countries
        setCountries([
            { id: 1, name: "France (Schengen)", isoCode: "FR", isActive: true },
            { id: 2, name: "United Arab Emirates", isoCode: "AE", isActive: true },
            { id: 3, name: "United Kingdom", isoCode: "GB", isActive: true },
            { id: 4, name: "Singapore", isoCode: "SG", isActive: true },
            { id: 5, name: "United States", isoCode: "US", isActive: true },
            { id: 6, name: "Germany (Schengen)", isoCode: "DE", isActive: true },
            { id: 7, name: "Canada", isoCode: "CA", isActive: true },
            { id: 8, name: "Australia", isoCode: "AU", isActive: true },
            { id: 9, name: "Switzerland (Schengen)", isoCode: "CH", isActive: true },
            { id: 10, name: "Japan", isoCode: "JP", isActive: true },
            { id: 11, name: "Thailand", isoCode: "TH", isActive: true },
            { id: 12, name: "Italy (Schengen)", isoCode: "IT", isActive: true },
          ]);
      }

      // Load saved travellers if user ID is known
      if (user?.id) {
        try {
          const travRes = await getUserTravellersApi(user.id);
          if (travRes.success && travRes.data) {
            setSavedTravellers(travRes.data);
          }
        } catch {
          // Silently handle if no saved travellers yet
        }
      }

      setLoadingInitial(false);
    }

    initData();
  }, []);

  // When country is selected, fetch visa types and smoothly switch collapsible panels
  const handleSelectCountry = async (country: CountryResponse) => {
    setSelectedCountry(country);
    setSelectedVisaType(null);
    setIsCountryOpen(false); // Collapses destination country panel
    setIsVisaTypeOpen(true); // Automatically expands visa category panel
    setLoadingVisaTypes(true);
    setErrorMessage(null);

    try {
      const vtRes = await getVisaTypesByCountryApi(country.id);
      if (vtRes.success && vtRes.data && vtRes.data.length > 0) {
        setVisaTypes(vtRes.data.filter((vt) => vt.isActive !== false));
      } else {
        // Fallback visa types for demo
        setVisaTypes([
          {
            id: 1,
            countryId: country.id,
            name: `${country.name} Tourist Visa`,
            description: "Standard tourist visa for leisure, sightseeing and family visits.",
            processingTimeDays: 10,
            embassyFee: 7500,
            serviceFee: 1500,
            totalFee: 9000,
            currency: "INR",
          },
          {
            id: 2,
            countryId: country.id,
            name: `${country.name} Business Visa`,
            description: "For attending conferences, meetings, or client discussions.",
            processingTimeDays: 7,
            embassyFee: 9500,
            serviceFee: 2000,
            totalFee: 11500,
            currency: "INR",
          },
        ]);
      }
    } catch {
      // Fallback
      setVisaTypes([
        {
          id: 101,
          countryId: country.id,
          name: `${country.name} Tourist Visa`,
          description: "Standard tourist visa for leisure, sightseeing and family visits.",
          processingTimeDays: 10,
          embassyFee: 7500,
          serviceFee: 1500,
          totalFee: 9000,
          currency: "INR",
        },
        {
          id: 102,
          countryId: country.id,
          name: `${country.name} Business Visa`,
          description: "For attending conferences, meetings, or client discussions.",
          processingTimeDays: 7,
          embassyFee: 9500,
          serviceFee: 2000,
          totalFee: 11500,
          currency: "INR",
        },
      ]);
    } finally {
      setLoadingVisaTypes(false);
    }
  };

  // Switch Mode handler
  const handleModeChange = (mode: "INDIVIDUAL" | "GROUP") => {
    setApplicationMode(mode);
    if (mode === "INDIVIDUAL") {
      // Reset to 1 applicant
      setApplicants((prev) => [prev[0] || { ...emptyTravellerForm }]);
    } else {
      // If group, make sure at least 2 applicant slots exist or keep existing
      if (applicants.length < 2) {
        setApplicants((prev) => [...prev, { ...emptyTravellerForm }]);
      }
    }
  };

  // Add applicant row in group mode
  const handleAddApplicant = () => {
    setApplicants((prev) => [...prev, { ...emptyTravellerForm }]);
  };

  // Remove applicant row
  const handleRemoveApplicant = (index: number) => {
    if (applicants.length <= 1) return;
    setApplicants((prev) => prev.filter((_, i) => i !== index));
  };

  // Update applicant field
  const handleApplicantChange = (
    index: number,
    field: keyof NewTravellerFormData,
    value: string
  ) => {
    setApplicants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Select an existing saved traveller for a slot
  const handleSelectSavedTraveller = (index: number, travellerId: string) => {
    const found = savedTravellers.find((t) => t.id === travellerId);
    if (!found) return;

    setApplicants((prev) => {
      const updated = [...prev];
      updated[index] = {
        id: found.id,
        firstName: found.firstName,
        lastName: found.lastName,
        passportNumber: found.passportNumber,
        passportExpiry: found.passportExpiry,
        dateOfBirth: found.dateOfBirth,
        nationality: found.nationality || "Indian",
        gender: found.gender || "Male",
        isExisting: true,
      };
      return updated;
    });
  };

  // Validate applicants before advancing
  const validateApplicants = (): boolean => {
    for (let i = 0; i < applicants.length; i++) {
      const app = applicants[i];
      if (!app.firstName.trim() || !app.lastName.trim()) {
        setErrorMessage(`Applicant #${i + 1}: First and last name are required.`);
        return false;
      }
      if (!app.passportNumber.trim()) {
        setErrorMessage(`Applicant #${i + 1}: Passport number is required.`);
        return false;
      }
      if (!app.passportExpiry) {
        setErrorMessage(`Applicant #${i + 1}: Passport expiry date is required.`);
        return false;
      }
      // Check passport expiry is future
      const expiry = new Date(app.passportExpiry);
      if (expiry <= new Date()) {
        setErrorMessage(`Applicant #${i + 1}: Passport expiry date must be in the future.`);
        return false;
      }
      if (!app.dateOfBirth) {
        setErrorMessage(`Applicant #${i + 1}: Date of birth is required.`);
        return false;
      }
      // Check DOB is in past
      const dob = new Date(app.dateOfBirth);
      if (dob >= new Date()) {
        setErrorMessage(`Applicant #${i + 1}: Date of birth must be in the past.`);
        return false;
      }
      if (!app.nationality.trim()) {
        setErrorMessage(`Applicant #${i + 1}: Nationality is required.`);
        return false;
      }
    }
    setErrorMessage(null);
    return true;
  };

  // Submit Application
  const handleSubmitApplication = () => {
    setErrorMessage(null);

    if (!selectedVisaType) {
      setErrorMessage("Please select a visa category before submitting.");
      return;
    }

    startTransition(async () => {
      try {
        const userId = currentUser?.id || "d147ee2c-29ea-47a4-8494-0cf11dbbaae4"; // fallback user UUID
        const finalTravellerIds: string[] = [];

        // 1. Ensure all applicants are saved as TravellerProfiles in backend
        for (const applicant of applicants) {
          if (applicant.id && applicant.isExisting) {
            finalTravellerIds.push(applicant.id);
          } else {
            // Save new traveller profile
            const createTravRes = await createTravellerApi({
              userId,
              firstName: applicant.firstName.trim(),
              lastName: applicant.lastName.trim(),
              passportNumber: applicant.passportNumber.trim().toUpperCase(),
              passportExpiry: applicant.passportExpiry,
              dateOfBirth: applicant.dateOfBirth,
              nationality: applicant.nationality.trim(),
              gender: applicant.gender || "Male",
            });

            if (createTravRes.success && createTravRes.data?.id) {
              finalTravellerIds.push(createTravRes.data.id);
            } else {
              throw new Error(
                createTravRes.error?.message ||
                  `Failed to create traveller profile for ${applicant.firstName} ${applicant.lastName}.`
              );
            }
          }
        }

        // 2. Call single or group application endpoint
        if (applicationMode === "INDIVIDUAL") {
          const appRes = await createSingleApplicationApi({
            travellerId: finalTravellerIds[0],
            visaTypeId: selectedVisaType.id,
          });

          if (appRes.success && appRes.data) {
            setSuccessData({
              groupReference: appRes.data.groupReference,
              applications: [appRes.data],
            });
            setCurrentStep("SUCCESS");
          } else {
            throw new Error(appRes.error?.message || "Failed to create visa application.");
          }
        } else {
          // GROUP APPLICATION
          const groupRes = await createGroupApplicationApi({
            visaTypeId: selectedVisaType.id,
            travellerIds: finalTravellerIds,
          });

          if (groupRes.success && groupRes.data) {
            const list = Array.isArray(groupRes.data) ? groupRes.data : [groupRes.data];
            setSuccessData({
              groupReference: list[0]?.groupReference,
              applications: list,
            });
            setCurrentStep("SUCCESS");
          } else {
            throw new Error(groupRes.error?.message || "Failed to create group visa applications.");
          }
        }
      } catch (err: unknown) {
        if (err instanceof ApiClientError) {
          setErrorMessage(err.apiError.message || "An error occurred with the API.");
        } else if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Failed to submit visa application. Please try again.");
        }
      }
    });
  };


  // Filtered countries based on live search query
  const filteredCountries = countries.filter((c) => {
    if (!countrySearch.trim()) return true;
    const q = countrySearch.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.isoCode.toLowerCase().includes(q)
    );
  });

  // Fee computations
  const embassyFee = selectedVisaType?.embassyFee || 0;
  const serviceFee = selectedVisaType?.serviceFee || 0;
  const feePerPerson = selectedVisaType?.totalFee || embassyFee + serviceFee;
  const totalCost = feePerPerson * applicants.length;
  const currency = selectedVisaType?.currency || "INR";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground pb-20">
      {/* 1. Dynamic Primary Navbar */}
      <Navbar user={currentUser} />

      {/* 2. Page Sub-Header for Context & Actions */}
      <div className="border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelAndExit}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Cancel and back to dashboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">New Visa Application</h1>
              <p className="text-[11px] text-muted-foreground">Individual & Group Travel Wizard</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-muted-foreground hover:text-foreground"
            onClick={handleCancelAndExit}
          >
            Cancel & Exit
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Step Indicator */}
        {currentStep !== "SUCCESS" && (
          <Stepper
            steps={APPLICATION_STEPS}
            activeStep={currentStep}
            onStepClick={(step, index) => {
              const stepOrder: Step[] = ["DESTINATION", "MODE", "TRAVELLERS", "REVIEW"];
              const currentIdx = stepOrder.indexOf(currentStep);
              if (index < currentIdx) {
                setErrorMessage(null);
                setCurrentStep(step.id as Step);
              }
            }}
          />
        )}

        {/* Error notification banner */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 text-sm flex items-start gap-3 shadow-sm"
          >
            <svg
              className="h-5 w-5 shrink-0 mt-0.5 text-destructive"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeWidth="2" d="M12 8v4m0 4h.01" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold">Action Required</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* STEP 1: DESTINATION & VISA TYPE (WITH COLLAPSIBLE ACCORDION) */}
        {currentStep === "DESTINATION" && (
          <div className="space-y-4">
            {/* COLLAPSIBLE 1: Select Destination Country */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all">
              <Collapsible
                open={isCountryOpen}
                onOpenChange={(open) => setIsCountryOpen(open)}
              >
                {/* Header Trigger */}
                <CollapsibleTrigger className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      1
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-semibold tracking-tight text-foreground">
                          Destination Country
                        </h2>
                        {selectedCountry && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {selectedCountry.name} ({selectedCountry.isoCode})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {selectedCountry
                          ? "Selected destination • Click to change or re-select"
                          : "Choose where you or your group will be traveling"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    {selectedCountry && (
                      <span className="text-xs font-medium text-primary hover:underline hidden sm:inline-block">
                        {isCountryOpen ? "Collapse" : "Change"}
                      </span>
                    )}
                    <div className={`p-1.5 rounded-lg border border-border bg-muted/30 text-muted-foreground transition-transform duration-200 ${isCountryOpen ? "rotate-180" : ""}`}>
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </CollapsibleTrigger>

                                {/* Collapsible Country Selection Grid */}
                <CollapsibleContent>
                  <div className="px-5 pb-6 md:px-6 border-t border-border/60 pt-4 space-y-4">
                    {/* Live Search Input Bar */}
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search destination country by name or code (e.g. France, UAE, UK, Singapore, US)..."
                          className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-input bg-muted/40 hover:bg-muted/70 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/70"
                        />
                        {countrySearch && (
                          <button
                            type="button"
                            onClick={() => setCountrySearch("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                            aria-label="Clear search"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Popular Quick-Select Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[11px] font-medium text-muted-foreground mr-1">Top Destinations:</span>
                        {["France", "UAE", "United Kingdom", "Singapore", "United States", "Japan"].map((name) => {
                          const isMatch = countrySearch.toLowerCase() === name.toLowerCase();
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => setCountrySearch(isMatch ? "" : name)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                                isMatch
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                  : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              {name}
                            </button>
                          );
                        })}
                        {countrySearch && (
                          <button
                            type="button"
                            onClick={() => setCountrySearch("")}
                            className="text-[11px] text-primary hover:underline font-medium ml-auto cursor-pointer"
                          >
                            Reset Filter
                          </button>
                        )}
                      </div>
                    </div>

                    {loadingInitial ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <div key={n} className="h-16 rounded-xl bg-muted/60 animate-pulse border border-border" />
                        ))}
                      </div>
                    ) : filteredCountries.length === 0 ? (
                      <div className="py-8 text-center space-y-2 rounded-xl border border-dashed border-border bg-muted/20">
                        <p className="text-sm font-semibold text-foreground">
                          No destinations found matching &quot;{countrySearch}&quot;
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Check spelling or try searching by country code like &apos;FR&apos;, &apos;AE&apos;, &apos;GB&apos;.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCountrySearch("")}
                          className="mt-2 text-xs h-8 cursor-pointer"
                        >
                          View All Destinations
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                        {filteredCountries.map((country) => {
                          const isSelected = selectedCountry?.id === country.id;
                          return (
                            <button
                              key={country.id}
                              type="button"
                              onClick={() => handleSelectCountry(country)}
                              className={`flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                                  : "border-border bg-card hover:bg-muted/50 hover:border-zinc-300 dark:hover:border-zinc-700"
                              }`}
                            >
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs uppercase tracking-wider border border-border">
                                {country.isoCode}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{country.name}</p>
                                <p className="text-xs text-muted-foreground">{country.isoCode} Destination</p>
                              </div>
                              {isSelected && (
                                <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* COLLAPSIBLE 2: Select Visa Category */}
            <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-all ${
              !selectedCountry ? "opacity-60 border-border/60 bg-muted/10 cursor-not-allowed" : "border-border"
            }`}>
              <Collapsible
                open={isVisaTypeOpen && !!selectedCountry}
                onOpenChange={(open) => {
                  if (selectedCountry) setIsVisaTypeOpen(open);
                }}
                disabled={!selectedCountry}
              >
                {/* Header Trigger */}
                <CollapsibleTrigger
                  disabled={!selectedCountry}
                  className={`w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors ${
                    selectedCountry ? "hover:bg-muted/40 cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      selectedCountry
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      2
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-semibold tracking-tight text-foreground">
                          Visa Category {selectedCountry ? `for ${selectedCountry.name}` : ""}
                        </h2>
                        {selectedVisaType && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {selectedVisaType.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {!selectedCountry
                          ? "Please select a destination country first"
                          : selectedVisaType
                          ? `${selectedVisaType.name} • ${selectedVisaType.currency || "INR"} ${(selectedVisaType.totalFee || selectedVisaType.embassyFee + selectedVisaType.serviceFee).toLocaleString()} per person`
                          : `Choose the visa type matching your travel purpose in ${selectedCountry.name}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    {selectedCountry && (
                      <div className={`p-1.5 rounded-lg border border-border bg-muted/30 text-muted-foreground transition-transform duration-200 ${
                        isVisaTypeOpen ? "rotate-180" : ""
                      }`}>
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </CollapsibleTrigger>

                {/* Collapsible Visa Types Content */}
                <CollapsibleContent>
                  <div className="px-5 pb-6 md:px-6 border-t border-border/60 pt-4 space-y-4">
                    {loadingVisaTypes ? (
                      <div className="space-y-3">
                        <div className="h-24 rounded-xl bg-muted/60 animate-pulse border border-border" />
                        <div className="h-24 rounded-xl bg-muted/60 animate-pulse border border-border" />
                      </div>
                    ) : visaTypes.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No active visa types available for this country. Please select another.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {visaTypes.map((vt) => {
                          const isSelected = selectedVisaType?.id === vt.id;
                          return (
                            <div
                              key={vt.id}
                              onClick={() => setSelectedVisaType(vt)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                isSelected
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                                  : "border-border bg-card hover:bg-muted/40 hover:border-zinc-300 dark:hover:border-zinc-700"
                              }`}
                            >
                              <div className="space-y-1 max-w-lg">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">{vt.name}</span>
                                  {vt.processingTimeDays && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                                      ~{vt.processingTimeDays} Days Processing
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {vt.description || "Official visa application category."}
                                </p>
                              </div>

                              <div className="sm:text-right shrink-0">
                                <p className="text-lg font-bold text-foreground">
                                  {vt.currency || "INR"} {(vt.totalFee || vt.embassyFee + vt.serviceFee).toLocaleString()}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  per applicant (Embassy + Service)
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Button
                        disabled={!selectedVisaType}
                        onClick={() => {
                          setErrorMessage(null);
                          setCurrentStep("MODE");
                        }}
                        className="font-medium"
                      >
                        Continue to Application Type &rarr;
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        )}

        {/* STEP 2: INDIVIDUAL OR GROUP MODE */}
        {currentStep === "MODE" && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Select Application Type</h2>
              <p className="text-sm text-muted-foreground">
                Will you be applying just for yourself or for multiple travellers / family members together?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Individual Card */}
              <div
                onClick={() => handleModeChange("INDIVIDUAL")}
                className={`p-6 rounded-xl border cursor-pointer transition-all space-y-3 ${
                  applicationMode === "INDIVIDUAL"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-base">Individual Application</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Apply for a single traveller. You will be able to attach companion travellers later if your plans change.
                  </p>
                </div>
              </div>

              {/* Group Card */}
              <div
                onClick={() => handleModeChange("GROUP")}
                className={`p-6 rounded-xl border cursor-pointer transition-all space-y-3 ${
                  applicationMode === "GROUP"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-bold text-lg">
                  2+
                </div>
                <div>
                  <h3 className="font-semibold text-base">Group / Family Application</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Apply for 2 or more travellers together under a shared Group Reference (e.g. family vacation, corporate team).
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("DESTINATION")}
              >
                &larr; Back
              </Button>
              <Button
                onClick={() => {
                  setErrorMessage(null);
                  setCurrentStep("TRAVELLERS");
                }}
              >
                Continue to Travellers Details &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: TRAVELLERS INFORMATION */}
        {currentStep === "TRAVELLERS" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {applicationMode === "INDIVIDUAL"
                      ? "Traveller Biodata & Passport"
                      : "Group Travellers Roster"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {applicationMode === "INDIVIDUAL"
                      ? "Enter passport and personal details for the visa applicant."
                      : "Add all travellers traveling together under this group application."}
                  </p>
                </div>

                {applicationMode === "GROUP" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddApplicant}
                    className="font-medium"
                  >
                    + Add Companion Traveller
                  </Button>
                )}
              </div>
            </div>

            {/* Applicant Forms */}
            {applicants.map((applicant, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-sm">
                      {applicationMode === "INDIVIDUAL"
                        ? "Primary Applicant"
                        : `Applicant #${index + 1}`}
                    </h3>
                  </div>

                  {applicationMode === "GROUP" && applicants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveApplicant(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-8"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* Saved Travellers Quick-Select Dropdown if user has existing profiles */}
                {savedTravellers.length > 0 && (
                  <div className="p-3 rounded-lg bg-muted/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Have applied before? Select an existing traveller:
                    </p>
                    <select
                      className="text-xs rounded-md border border-border bg-background px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSelectSavedTraveller(index, e.target.value);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Choose saved traveller...
                      </option>
                      {savedTravellers.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.firstName} {st.lastName} ({st.passportNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">First Name *</Label>
                    <Input
                      placeholder="e.g. Rahul"
                      value={applicant.firstName}
                      onChange={(e) =>
                        handleApplicantChange(index, "firstName", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Name *</Label>
                    <Input
                      placeholder="e.g. Verma"
                      value={applicant.lastName}
                      onChange={(e) =>
                        handleApplicantChange(index, "lastName", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Passport Number *</Label>
                    <Input
                      placeholder="e.g. N1234567"
                      value={applicant.passportNumber}
                      onChange={(e) =>
                        handleApplicantChange(
                          index,
                          "passportNumber",
                          e.target.value.toUpperCase()
                        )
                      }
                      className="text-sm uppercase font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Passport Expiry Date * (Future)</Label>
                    <Input
                      type="date"
                      value={applicant.passportExpiry}
                      onChange={(e) =>
                        handleApplicantChange(index, "passportExpiry", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Date of Birth * (Past)</Label>
                    <Input
                      type="date"
                      value={applicant.dateOfBirth}
                      onChange={(e) =>
                        handleApplicantChange(index, "dateOfBirth", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Nationality *</Label>
                    <Input
                      placeholder="e.g. Indian"
                      value={applicant.nationality}
                      onChange={(e) =>
                        handleApplicantChange(index, "nationality", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Gender</Label>
                    <select
                      value={applicant.gender}
                      onChange={(e) =>
                        handleApplicantChange(index, "gender", e.target.value)
                      }
                      className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("MODE")}
              >
                &larr; Back
              </Button>
              <Button
                onClick={() => {
                  if (validateApplicants()) {
                    setCurrentStep("REVIEW");
                  }
                }}
              >
                Review Application & Cost &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRMATION */}
        {currentStep === "REVIEW" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Review Application Summary</h2>
                <p className="text-sm text-muted-foreground">
                  Verify your trip details, applicant list, and estimated visa fee schedule before creating the application draft.
                </p>
              </div>

              {/* Trip & Visa Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Destination
                  </p>
                  <p className="font-semibold text-sm mt-0.5">{selectedCountry?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedCountry?.isoCode}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Visa Category
                  </p>
                  <p className="font-semibold text-sm mt-0.5">{selectedVisaType?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ~{selectedVisaType?.processingTimeDays || 7} Days Processing
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Application Type
                  </p>
                  <p className="font-semibold text-sm mt-0.5">
                    {applicationMode === "INDIVIDUAL" ? "Individual" : "Group / Family"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {applicants.length} Applicant{applicants.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Applicant list breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Applicants Roster</h3>
                <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                  {applicants.map((app, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center font-bold text-[11px]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-sm">
                            {app.firstName} {app.lastName}
                          </p>
                          <p className="text-muted-foreground">
                            Passport: <span className="font-mono">{app.passportNumber}</span> (Exp:{" "}
                            {app.passportExpiry})
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right text-muted-foreground">
                        <p>{app.nationality} &bull; {app.gender}</p>
                        <p>DOB: {app.dateOfBirth}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Fee Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Estimated Fee Schedule</h3>
                <div className="rounded-xl border border-border p-4 space-y-2 bg-muted/20 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Government / Embassy Fee (per person)</span>
                    <span className="font-medium">
                      {currency} {embassyFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VisaFlow Service & Processing Fee (per person)</span>
                    <span className="font-medium">
                      {currency} {serviceFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t border-border">
                    <span>Total per Applicant</span>
                    <span>
                      {currency} {feePerPerson.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-primary pt-2 border-t border-border">
                    <span>Grand Total ({applicants.length} Applicant{applicants.length > 1 ? "s" : ""})</span>
                    <span>
                      {currency} {totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  * Note: Model B flow. Creating this application generates your official tracking reference. Payment and document upload will be completed in your dashboard checklist.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("TRAVELLERS")}
                  disabled={isPending}
                >
                  &larr; Back to Travellers
                </Button>
                <Button
                  onClick={handleSubmitApplication}
                  disabled={isPending}
                  className="font-medium min-w-36"
                >
                  {isPending ? "Submitting..." : "Create Visa Application"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS STATE */}
        {currentStep === "SUCCESS" && successData && (
          <div className="rounded-2xl border border-border bg-card p-8 shadow-md text-center max-w-xl mx-auto space-y-6">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Application Created!</h2>
              <p className="text-sm text-muted-foreground">
                Your visa application draft has been successfully registered in the system.
              </p>
            </div>

            {successData.groupReference && (
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Group Reference Code
                </p>
                <p className="font-mono text-base font-bold text-primary">
                  {successData.groupReference}
                </p>
              </div>
            )}

            <div className="text-left space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Generated Applications:
              </p>
              <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                {successData.applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-card flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {app.travellerFullName || "Applicant"}
                      </p>
                      <p className="font-mono text-muted-foreground text-[11px]">
                        Ref: {app.referenceNumber}
                      </p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                      Started (Documents Pending)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  Go to Client Dashboard &rarr;
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleResetApplication}
              >
                Create Another Application
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
