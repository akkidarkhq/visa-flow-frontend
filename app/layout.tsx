import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ChatWidget } from "@/components/chatbot";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading-font",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-font",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VisaFlow - Visa Application & Document Management",
  description: "Modern visa application tracking and management portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased overflow-x-hidden",
        plusJakartaSans.variable,
        inter.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden w-full max-w-[100vw]">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
