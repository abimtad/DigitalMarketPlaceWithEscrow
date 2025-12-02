import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { Navbar } from "@/components/layout/Navbar";

// Enable dark mode base classes using Tailwind's class strategy
// (Assumes Tailwind configured with darkMode: 'class')

export const metadata: Metadata = {
  title: "Decentralized Marketplace",
  description: "Trustless escrow marketplace built on Ethereum",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100 transition-colors bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
