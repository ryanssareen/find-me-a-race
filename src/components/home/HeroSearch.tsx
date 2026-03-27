"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SerializedRace } from "@/lib/types/race";

interface RaceResult {
  race: SerializedRace;
}

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const router = useRouter();

  const searchRaces = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/races/search?q=${encodeURIComponent(q.trim())}&limit=3`);
      const data = await res.json();
      setResults(
        (data.races || []).slice(0, 3).map((race: SerializedRace) => ({ race }))
      );
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search as user types
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      searchRaces(query);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, searchRaces]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(searchQuery?: string) {
    const q = searchQuery || query;
    if (q.trim()) {
      router.push(`/races?q=${encodeURIComponent(q.trim())}`);
    } else {
      router.push("/races");
    }
    setShowDropdown(false);
  }

  function handleNearMe() {
    if (!navigator.geolocation) {
      handleSearch("Delhi");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
            { headers: { "User-Agent": "FindMeARace/1.0" } }
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            data.address?.state ||
            "";
          if (city) {
            setQuery(city);
            handleSearch(city);
          } else {
            router.push(`/races?lat=${latitude}&lng=${longitude}`);
          }
        } catch {
          router.push(`/races?lat=${latitude}&lng=${longitude}`);
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        router.push("/races");
      },
      { timeout: 8000 }
    );
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIdx >= 0 && results[selectedIdx]) {
        router.push(`/races/${results[selectedIdx].race.slug}`);
        setShowDropdown(false);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    } else if (e.key === "ArrowDown" && showDropdown) {
      e.preventDefault();
      // +1 for "View all" row
      setSelectedIdx((i) => Math.min(i + 1, results.length));
    } else if (e.key === "ArrowUp" && showDropdown) {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, -1));
    }
  }

  const hasResults = results.length > 0;
  const hasQuery = query.trim().length >= 2;

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Search bar */}
      <div className="relative">
        <div className="flex items-center rounded-2xl bg-white shadow-xl ring-1 ring-zinc-200/60">
          <div className="flex items-center pl-5 text-zinc-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              setSelectedIdx(-1);
            }}
            onFocus={() => {
              if (hasQuery) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search city, state, or race name..."
            className="flex-1 bg-transparent px-4 py-4.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none sm:text-lg"
          />
          <button
            onClick={handleNearMe}
            disabled={locating}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 disabled:opacity-50 sm:px-4 sm:text-sm"
            title="Use my location"
          >
            {locating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-700" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
              </svg>
            )}
            <span className="hidden sm:inline">{locating ? "Locating..." : "Near me"}</span>
          </button>
          <button
            onClick={() => handleSearch()}
            className="mr-2 flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700 sm:px-4"
            title="Search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {/* Live search results dropdown */}
        {showDropdown && hasQuery && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl"
          >
            {searching && results.length === 0 && (
              <div className="flex items-center gap-3 px-5 py-4 text-sm text-zinc-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                Searching races...
              </div>
            )}

            {!searching && hasQuery && results.length === 0 && (
              <div className="px-5 py-4 text-sm text-zinc-400">
                No races found for &ldquo;{query}&rdquo;
              </div>
            )}

            {hasResults && (
              <>
                <div className="px-4 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Races
                </div>
                {results.map(({ race }, i) => (
                  <Link
                    key={race.id}
                    href={`/races/${race.slug}`}
                    onClick={() => setShowDropdown(false)}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                      i === selectedIdx
                        ? "bg-blue-50"
                        : "hover:bg-zinc-50"
                    }`}
                  >
                    {/* Date badge */}
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <span className="text-xs font-bold leading-none">
                        {new Date(race.date).toLocaleDateString("en-IN", { day: "numeric" })}
                      </span>
                      <span className="text-[10px] font-medium uppercase leading-tight">
                        {new Date(race.date).toLocaleDateString("en-IN", { month: "short" })}
                      </span>
                    </div>
                    {/* Race info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {race.name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {race.city}, {race.state} &middot; {formatDate(race.date)}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {race.distances.slice(0, 4).map((d) => (
                          <span
                            key={d}
                            className="inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Arrow */}
                    <svg className="mt-1 h-4 w-4 shrink-0 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                ))}

                {/* View all link */}
                <button
                  onClick={() => handleSearch()}
                  className={`flex w-full items-center justify-center gap-1 border-t border-zinc-100 px-4 py-3 text-sm font-medium text-blue-600 transition-colors ${
                    selectedIdx === results.length
                      ? "bg-blue-50"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  View all results for &ldquo;{query}&rdquo;
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick city links */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-zinc-400">Popular:</span>
        {["Delhi", "Mumbai", "Bengaluru", "Pune", "Hyderabad", "Goa"].map(
          (city) => (
            <button
              key={city}
              onClick={() => handleSearch(city)}
              className="rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-900"
            >
              {city}
            </button>
          )
        )}
      </div>
    </div>
  );
}
