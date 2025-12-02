"use client";
import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Container } from "./Container";

// Navigation simplified; 'Buy' removed so purchase actions stay on product pages / landing
const links = [
  { href: "/sell", label: "Sell" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/disputes", label: "Disputes" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <Container className="h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-lg tracking-tight text-gray-900 dark:text-gray-100"
        >
          Marketplace
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Button
              key={l.href}
              variant={pathname === l.href ? "secondary" : "ghost"}
              className="px-3"
            >
              <Link href={l.href}>{l.label}</Link>
            </Button>
          ))}
          <ThemeToggle />
          <WalletConnect />
        </nav>
      </Container>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.06),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_60%)]" />
    </header>
  );
}
