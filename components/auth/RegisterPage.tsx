"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { registerApi } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { ApiError, ApiResponse, User } from "@/lib/api/types";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Standard API Response & Error states
  const [apiResponse, setApiResponse] = useState<ApiResponse<User> | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset previous feedback states
    setApiError(null);
    setApiResponse(null);
    setIsLoading(true);

    try {
      // 1. Call registration API
      const response = await registerApi({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        role: "CLIENT",
      });

      // 2. Read standard ApiResponse
      setApiResponse(response);

      // On successful registration, redirect to login page
      if (response.success) {
        setTimeout(() => {
          router.push("/login");
        }, 1200);
      }
    } catch (err: unknown) {
      // 3. Read standard ApiError
      if (err instanceof ApiClientError) {
        setApiError(err.apiError);
      } else {
        setApiError({
          message: err instanceof Error ? err.message : "An unexpected error occurred during registration.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setApiError(null);
    setApiResponse(null);
  };

  // Helper to extract field-specific validation errors returned by backend
  const fullNameError = apiError?.validationErrors?.fullName;
  const usernameError = apiError?.validationErrors?.username;
  const emailError = apiError?.validationErrors?.email;
  const phoneError = apiError?.validationErrors?.phoneNumber;
  const passwordError = apiError?.validationErrors?.password;

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg border border-border bg-card shadow-sm">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* General API Error Banner */}
          {apiError && (
            <div
              role="alert"
              className="p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/20"
            >
              <div className="font-semibold">
                {apiError.code ? `Error [${apiError.code}]` : "Registration Failed"}
              </div>
              <div>{apiError.message}</div>
            </div>
          )}

          {/* General API Success Banner */}
          {apiResponse && apiResponse.success && (
            <div
              role="status"
              className="p-3 text-sm rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
            >
              <div className="font-semibold">Success</div>
              <div>
                {apiResponse.message || "User registered successfully! Redirecting to sign in..."}
              </div>
            </div>
          )}

          {/* Full Name Field */}
          <Field data-invalid={!!fullNameError}>
            <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
            <Input
              id="fullName"
              type="text"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              required
            />
            {fullNameError && (
              <FieldError errors={[{ message: fullNameError }]} />
            )}
          </Field>

          {/* Username Field */}
          <Field data-invalid={!!usernameError}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
            {usernameError && (
              <FieldError errors={[{ message: usernameError }]} />
            )}
          </Field>

          {/* Email Field */}
          <Field data-invalid={!!emailError}>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            {emailError && (
              <FieldError errors={[{ message: emailError }]} />
            )}
          </Field>

          {/* Phone Number Field */}
          <Field data-invalid={!!phoneError}>
            <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              required
            />
            {phoneError && (
              <FieldError errors={[{ message: phoneError }]} />
            )}
          </Field>

          {/* Password Field */}
          <Field data-invalid={!!passwordError}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
            />
            <FieldDescription>
              Must be at least 6 characters long.
            </FieldDescription>
            {passwordError && (
              <FieldError errors={[{ message: passwordError }]} />
            )}
          </Field>

          {/* Actions */}
          <Field orientation="horizontal" className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
