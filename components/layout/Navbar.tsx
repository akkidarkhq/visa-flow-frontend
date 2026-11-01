"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getUserProfileApi, logoutApi } from "@/lib/api/auth";
import { User } from "@/lib/api/types";

export interface NavLinkItem {
  label: string;
  href: string;
  badge?: string | number;
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  brandName?: string;
  brandHref?: string;
  logoLetter?: string;
  navLinks?: NavLinkItem[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showNewApplicationButton?: boolean;
  user?: User | null;
}

const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "New Application", href: "/dashboard/new-application" },
];

export function Navbar({
  brandName = "VisaFlow",
  brandHref = "/dashboard",
  logoLetter = "V",
  navLinks = DEFAULT_NAV_LINKS,
  showSearch = true,
  searchPlaceholder = "Search applications, reference #...",
  onSearch,
  showNewApplicationButton = true,
  user: userProp,
  className,
  ...props
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(userProp || null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Load user profile if not passed as prop
  React.useEffect(() => {
    if (userProp !== undefined) {
      setUser(userProp);
      return;
    }
    const cached = getCurrentUser();
    if (cached) {
      setUser(cached);
    } else {
      getUserProfileApi()
        .then((res) => {
          if (res.success && res.data) setUser(res.data);
        })
        .catch(() => {
          // Unauthenticated or fallback
        });
    }
  }, [userProp]);

  // Click outside listener to close user profile dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Default: navigate to dashboard with search param
      router.push(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      window.location.href = "/";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* 1. Left Section: Logo & Brand Name & Main Links */}
          <div className="flex items-center gap-6 lg:gap-8 min-w-0">
            {/* Logo and Brand */}
            <Link
              href={brandHref}
              className="flex items-center gap-2.5 font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity shrink-0"
            >
              <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-sm ring-1 ring-primary/20">
                {logoLetter}
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {brandName}
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/dashboard" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative flex items-center gap-1.5",
                      isActive
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <span>{link.label}</span>
                    {link.badge !== undefined && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/15 text-primary">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 2. Middle Section: Dynamic Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-md hidden sm:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
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
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.15 13.15z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-input bg-muted/40 hover:bg-muted/70 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/70"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </form>
            </div>
          )}

          {/* 3. Right Section: Action button & User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick action button */}
            {showNewApplicationButton && pathname !== "/dashboard/new-application" && (
              <Link href="/dashboard/new-application" className="hidden lg:block">
                <Button size="sm" className="gap-1.5 h-9 rounded-xl shadow-sm text-xs font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  New Application
                </Button>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                aria-expanded={profileDropdownOpen}
                aria-label="User menu"
              >
                {/* Avatar circle */}
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary/80 to-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
                  {getInitials(user?.fullName || "User")}
                </div>

                {/* Name & Role (desktop) */}
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                    {user?.fullName || "My Account"}
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-none capitalize">
                    {user?.role?.toLowerCase() || "Traveller"}
                  </span>
                </div>

                {/* Dropdown chevron */}
                <svg
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 hidden sm:block",
                    profileDropdownOpen && "rotate-180"
                  )}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu Modal */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 animate-in fade-in-0 zoom-in-95">
                  {/* User info header */}
                  <div className="px-3 py-2.5 border-b border-border mb-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {user?.fullName || "Registered User"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user?.email || "user@visaflow.com"}
                    </p>
                    {user?.role && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        {user.role}
                      </span>
                    )}
                  </div>

                  {/* Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
                    >
                      <svg
                        className="h-4 w-4 text-muted-foreground"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard Home
                    </Link>

                    <Link
                      href="/dashboard/new-application"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
                    >
                      <svg
                        className="h-4 w-4 text-muted-foreground"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      New Application
                    </Link>
                  </div>

                  {/* Sign out button */}
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted md:hidden"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-3">
            {/* Mobile Search */}
            {showSearch && (
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-muted/50"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.15 13.15z" />
                  </svg>
                </div>
              </form>
            )}

            {/* Links */}
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
export default Navbar;
