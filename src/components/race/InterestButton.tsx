"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";

interface InterestButtonProps {
  raceId: string;
  initialCount?: number;
}

export function InterestButton({ raceId, initialCount = 0 }: InterestButtonProps) {
  const [hasInterested, setHasInterested] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    // Check local storage to see if interest is already expressed
    const stored = localStorage.getItem("interested_races");
    if (stored) {
      try {
        const raceIds = JSON.parse(stored);
        if (Array.isArray(raceIds) && raceIds.includes(raceId)) {
          setHasInterested(true);
        }
      } catch {
        // Safe fallback if parsing fails
      }
    }
  }, [raceId]);

  const handleInterest = async () => {
    if (hasInterested || isPending) return;

    // Optimistic Update
    setHasInterested(true);
    setCount((prev) => prev + 1);
    setIsPending(true);

    try {
      const response = await fetch("/api/races/interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raceId }),
      });

      if (!response.ok) {
        throw new Error("Failed to register interest");
      }

      const data = await response.json();
      if (data.success && typeof data.interestCount === "number") {
        setCount(data.interestCount);
      }

      // Persist in localStorage
      const stored = localStorage.getItem("interested_races");
      let raceIds = [];
      if (stored) {
        try {
          raceIds = JSON.parse(stored);
          if (!Array.isArray(raceIds)) raceIds = [];
        } catch {
          raceIds = [];
        }
      }
      if (!raceIds.includes(raceId)) {
        raceIds.push(raceId);
        localStorage.setItem("interested_races", JSON.stringify(raceIds));
      }
    } catch (error) {
      console.error("Interest registration failed:", error);
      // Revert optimistic update on failure
      setHasInterested(false);
      setCount((prev) => Math.max(0, prev - 1));
    } finally {
      setIsPending(false);
    }
  };

  // Threshold of 5 before showing counts to keep social proof positive
  const showCount = count >= 5;

  return (
    <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-zinc-300">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-zinc-800">Interested in this race?</h3>
        <p className="text-xs text-zinc-500">
          Express interest to receive registration updates and coordinate with other runners.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleInterest}
          disabled={hasInterested || isPending}
          className={clsx(
            "group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20",
            hasInterested
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 cursor-default"
              : "bg-white text-zinc-700 border border-zinc-200 shadow-sm hover:border-zinc-300 hover:text-zinc-950 hover:bg-zinc-50 active:scale-95 cursor-pointer"
          )}
        >
          <svg
            className={clsx(
              "h-4 w-4 transition-transform duration-300",
              hasInterested ? "fill-emerald-600 text-emerald-600" : "text-zinc-400 group-hover:animate-bounce"
            )}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5"
            />
          </svg>
          {hasInterested ? "Interest expressed!" : "I'm interested"}
        </button>

        {/* Social Proof Display */}
        <span className="text-sm text-zinc-500">
          {showCount ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              {count} runners interested
            </span>
          ) : (
            <span className="italic text-zinc-400 text-xs">Be the first to show interest!</span>
          )}
        </span>
      </div>
    </div>
  );
}
