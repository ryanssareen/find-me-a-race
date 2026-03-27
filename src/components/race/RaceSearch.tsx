"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { SerializedRace, RaceType } from "@/lib/types/race";
import { RACE_TYPES, INDIAN_STATES } from "@/lib/utils/constants";
import { RaceCard } from "./RaceCard";
import { parseDate } from "@/lib/utils/date-parser";

export function RaceSearch({
  initialRaces,
  defaultType = "",
  defaultState = "",
  defaultQuery = "",
}: {
  initialRaces: SerializedRace[];
  defaultType?: RaceType | "";
  defaultState?: string;
  defaultQuery?: string;
}) {
  type SortBy = "relevance" | "date_asc" | "date_desc";
  const [query, setQuery] = useState(defaultQuery);
  const [typeFilter, setTypeFilter] = useState<RaceType | "">(defaultType);
  const [stateFilter, setStateFilter] = useState(defaultState);
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [races, setRaces] = useState(initialRaces);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Build suggestion pool from all known races
  const allSuggestionPool = useRef<string[]>([]);
  useEffect(() => {
    const pool = new Set<string>();
    initialRaces.forEach((r) => {
      pool.add(r.name);
      pool.add(r.city);
      pool.add(r.state);
      pool.add(r.organizerName);
    });
    allSuggestionPool.current = Array.from(pool).sort();
  }, [initialRaces]);

  const search = useCallback(
    async (q: string, type: RaceType | "", state: string, sort: SortBy = "relevance") => {
      // Client-side filter if we have initial data and no server-side needed
      if (initialRaces.length > 0) {
        let filtered = initialRaces;
        const lq = q.toLowerCase().trim();

        if (lq) {
          const { month, year, remainingQuery } = parseDate(lq);

          // Filter by month/year if detected
          if (month !== null) {
            filtered = filtered.filter((r) => {
              const d = new Date(r.date);
              return year !== null
                ? d.getMonth() === month && d.getFullYear() === year
                : d.getMonth() === month;
            });
          } else if (year !== null) {
            filtered = filtered.filter((r) => new Date(r.date).getFullYear() === year);
          }

          // Text search on remaining words
          const textQuery = remainingQuery || (month === null && year === null ? lq : "");
          if (textQuery) {
            filtered = filtered.filter(
              (r) =>
                r.name.toLowerCase().includes(textQuery) ||
                r.city.toLowerCase().includes(textQuery) ||
                r.state.toLowerCase().includes(textQuery) ||
                r.organizerName.toLowerCase().includes(textQuery)
            );
          }
        }
        if (type) {
          filtered = filtered.filter((r) => r.distances.includes(type));
        }
        if (state) {
          filtered = filtered.filter(
            (r) => r.state.toLowerCase() === state.toLowerCase()
          );
        }
        // Sort based on user selection
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (sort === "date_asc") {
          filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else if (sort === "date_desc") {
          filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
          // "relevance" — upcoming first (by date asc), then past (by date desc)
          filtered.sort((a, b) => {
            const aPast = new Date(a.date) < now;
            const bPast = new Date(b.date) < now;
            if (aPast !== bPast) return aPast ? 1 : -1;
            if (aPast && bPast) return new Date(b.date).getTime() - new Date(a.date).getTime();
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
        }
        setRaces(filtered);
        return;
      }

      // Fallback to API if no initial data
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (type) params.set("type", type);
        if (state) params.set("state", state);
        const res = await fetch(`/api/races/search?${params}`);
        const data = await res.json();
        setRaces(data.races);
      } catch {
        setRaces([]);
      } finally {
        setLoading(false);
      }
    },
    [initialRaces]
  );

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(query, typeFilter, stateFilter, sortBy);
    }, 150);
    return () => clearTimeout(debounceRef.current);
  }, [query, typeFilter, stateFilter, sortBy, search]);

  // Update suggestions as user types
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const lq = query.toLowerCase();
    const matches = allSuggestionPool.current
      .filter((s) => s.toLowerCase().includes(lq))
      .slice(0, 6);
    setSuggestions(matches);
    setSelectedIdx(-1);
  }, [query]);

  // Close suggestions on outside click
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      setQuery(suggestions[selectedIdx]);
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function pickSuggestion(s: string) {
    setQuery(s);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  const activeStates = Array.from(
    new Set(initialRaces.map((r) => r.state))
  ).sort();

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input with autocomplete */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
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
            placeholder="Search by race name, city, or state..."
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                className="flex items-center justify-center rounded p-1 text-zinc-400 hover:text-zinc-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={() => {
                setShowSuggestions(false);
                search(query, typeFilter, stateFilter, sortBy);
              }}
              className="flex items-center justify-center rounded-md bg-primary px-2 py-1.5 text-white transition-colors hover:bg-primary-dark"
              title="Search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg"
            >
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  onClick={() => pickSuggestion(s)}
                  className={`block w-full px-4 py-2 text-left text-sm ${
                    i === selectedIdx
                      ? "bg-primary/10 text-primary"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Distance filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as RaceType | "")}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All distances</option>
          {RACE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* State filter */}
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All states</option>
          {(activeStates.length > 0 ? activeStates : INDIAN_STATES).map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="relevance">Relevance</option>
          <option value="date_asc">Date ↑ (soonest first)</option>
          <option value="date_desc">Date ↓ (latest first)</option>
        </select>
      </div>

      {/* Active filters */}
      {(query || typeFilter || stateFilter || sortBy !== "relevance") && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400">Filters:</span>
          {query && (
            <FilterChip
              label={`"${query}"`}
              onRemove={() => setQuery("")}
            />
          )}
          {typeFilter && (
            <FilterChip
              label={typeFilter}
              onRemove={() => setTypeFilter("")}
            />
          )}
          {stateFilter && (
            <FilterChip
              label={stateFilter}
              onRemove={() => setStateFilter("")}
            />
          )}
          {sortBy !== "relevance" && (
            <FilterChip
              label={sortBy === "date_asc" ? "Date ↑" : "Date ↓"}
              onRemove={() => setSortBy("relevance")}
            />
          )}
          <button
            onClick={() => {
              setQuery("");
              setTypeFilter("");
              setStateFilter("");
              setSortBy("relevance");
            }}
            className="text-xs text-primary hover:text-primary-dark"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      <div className="mt-6">
        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-primary" />
            <p className="mt-3 text-sm text-zinc-400">Searching...</p>
          </div>
        ) : races.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-zinc-500">
              {races.length} race{races.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {races.map((race) => (
                <RaceCard key={race.id} race={race} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center">
            <svg
              className="mx-auto h-12 w-12 text-zinc-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <p className="mt-4 text-lg font-medium text-zinc-500">
              No races found
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {query || typeFilter || stateFilter
                ? "Try adjusting your search or filters."
                : "Races are being added — check back soon!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {label}
      <button onClick={onRemove} className="hover:text-primary-dark">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
