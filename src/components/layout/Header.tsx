"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black">
            F
          </span>
          <span>
            Find<span className="text-primary">Me</span>aRace
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/races"
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-secondary hover:text-foreground"
          >
            Browse Races
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="sm:hidden p-2 -mr-2 text-muted hover:text-foreground transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-border bg-card px-4 py-3 sm:hidden">
          <Link
            href="/races"
            className="block py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Browse Races
          </Link>
        </nav>
      )}
    </header>
  );
}
