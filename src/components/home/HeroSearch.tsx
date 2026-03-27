"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const POPULAR_CITIES = [
  "Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad",
  "Pune", "Kolkata", "Jaipur", "Kochi", "Goa",
];

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Update suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const lq = query.toLowerCase();
    const matches = POPULAR_CITIES.filter((c) =>
      c.toLowerCase().includes(lq)
    );
    setSuggestions(matches);
    setSelectedIdx(-1);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
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
        // Reverse geocode with Nominatim
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
        // Fallback: just go to races
        router.push("/races");
      },
      { timeout: 8000 }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIdx >= 0 && suggestions[selectedIdx]) {
        handleSearch(suggestions[selectedIdx]);
      } else {
        handleSearch();
      }
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    }
  }

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
              setShowSuggestions(true);
            }}
            onFocus={() => query.trim() && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search city, state, or race name..."
            className="flex-1 bg-transparent px-4 py-4.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none sm:text-lg"
          />
          <button
            onClick={handleNearMe}
            disabled={locating}
            className="mr-2 flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 disabled:opacity-50 sm:px-4 sm:text-sm"
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
        </div>

        {/* Autocomplete */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
          >
            {suggestions.map((s, i) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  setShowSuggestions(false);
                  handleSearch(s);
                }}
                className={`flex w-full items-center gap-3 px-5 py-3 text-left text-sm ${
                  i === selectedIdx
                    ? "bg-blue-50 text-blue-700"
                    : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                </svg>
                {s}
              </button>
            ))}
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
