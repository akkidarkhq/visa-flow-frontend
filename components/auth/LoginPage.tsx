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
import { loginApi } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { ApiError, ApiResponse, AuthData } from "@/lib/api/types";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  // Standard API Response & Error states
  const [apiResponse, setApiResponse] = useState<ApiResponse<AuthData> | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset previous feedback states
    setApiError(null);
    setApiResponse(null);
    setIsLoading(true);

    try {
      // 1. Calling standard API endpoint
      const response = await loginApi({ username, password });

      // 2. Reading standard ApiResponse
      setApiResponse(response);

      // On successful authentication, automatically redirect to client dashboard
      if (response.success) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch (err: unknown) {
      // 3. Reading standard ApiError
      if (err instanceof ApiClientError) {
        setApiError(err.apiError);
      } else {
        setApiError({
          message: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUsername("");
    setPassword("");
    setApiError(null);
    setApiResponse(null);
  };

  // Helper to extract field-specific validation errors if returned by backend
  const usernameError = apiError?.validationErrors?.username;
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
                {apiError.code ? `Error [${apiError.code}]` : "Request Failed"}
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
                {apiResponse.message || "Logged in successfully! Redirecting to Dashboard..."}
              </div>
            </div>
          )}

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

          {/* Password Field */}
          <Field data-invalid={!!passwordError}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <FieldDescription>
              We&apos;ll verify your credentials securely.
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
              {isLoading ? "Signing in..." : "Submit"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
