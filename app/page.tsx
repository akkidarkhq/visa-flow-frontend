import Link from "next/link";
import { Button } from "@/components/ui/button";
import LoginPage from "@/components/auth/LoginPage";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6">
      <main className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary text-primary-foreground font-bold text-2xl shadow-md mb-2">
            V
          </div>
          <h1 className="text-3xl font-bold tracking-tight">VisaFlow</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your visa applications and client dashboard
          </p>
        </div>

        <LoginPage />

        <div className="text-center text-xs text-muted-foreground pt-4">
          Looking for dashboard preview?{" "}
          <Link
              href="/register"
              className="font-medium underline underline-offset-4 hover:text-primary"
          >
            Register new user &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
