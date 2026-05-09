import { QueryProvider } from "@/providers/query-provider";
import { UserProvider } from "@/providers/user-provider";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import TopLoader from "nextjs-toploader";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auth System",
  description:
    "Session based authentication system with email verification, 2FA, and sessions management",

  icons: {
    icon: [
      {
        url: "/branding/favicon-light.ico",
        media: "(prefers-color-scheme: light)",
        type: "image/x-icon",
      },
      {
        url: "/branding/favicon-dark.ico",
        media: "(prefers-color-scheme: dark)",
        type: "image/x-icon",
      },
      {
        url: "/branding/icon-light.png",
        media: "(prefers-color-scheme: light)",
        type: "image/png",
      },
      {
        url: "/branding/icon-dark.png",
        media: "(prefers-color-scheme: dark)",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/branding/apple-icon-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/branding/apple-icon-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased scroll-smooth">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TopLoader showSpinner={false} />
          <Toaster position="top-right" richColors />
          <QueryProvider>
            <UserProvider>{children}</UserProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
