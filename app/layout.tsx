import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// Initialize the Inter font with specific subsets
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Define metadata for the site (good for SEO)
export const metadata: Metadata = {
  title: "Paprika LMS - Learn, Grow, Achieve",
  description: "Unlock your potential with expert-led courses on development, design, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}