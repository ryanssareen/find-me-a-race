"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { SerializedRace, RaceType } from "@/lib/types/race";
import { RACE_TYPES, INDIAN_STATES } from "@/lib/utils/constants";
import { RaceCard } from "./RaceCard";
import { parseDate } from "@/lib/utils/date-parser";
import { sortByRelevance } from "@/lib/utils/dates";

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
      if (initialRaces.length > 0) {
        let filtered = initialRaces;
        const lq = q.toLowerCase().trim();

        if (lq) {
          const { month, year, remainingQuery } = parseDate(lq);

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
        if (sort === "date_asc") {
          filtered = filtered.slice().sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        } else if (sort === "date_desc") {
          filtered = filtered.slice().sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        } else {
          filtered = sortByRelevance(filtered);
        }
        setRaces(filtered);
        return;
      }

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

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(query, typeFilter, stateFilter, sortBy);
    }, 150);
    return () => clearTimeout(debounceRef.current);
  }, [query, typeFilter, stateFilter, sortBy, search]);

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

  const hasFilters = query || typeFilter || stateFilter || sortBy !== "relevance";

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        {/* Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
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
            placeholder="Search by race name, city, date..."
            className="w-full rounded-xl border border-border bg-secondary py-3.5 pl-12 pr-12 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted hover:text-foreground transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Autocomplete */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
            >
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  onClick={() => pickSuggestion(s)}
                  className={`block w-full px-4 py-3 text-left transition-colors ${
                    i === selectedIdx
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as RaceType | "")}
            className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="">All distances</option>
            {RACE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
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

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="date_asc">Date (earliest)</option>
            <option value="date_desc">Date (latest)</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => {
                setQuery("");
                setTypeFilter("");
                setStateFilter("");
                setSortBy("relevance");
              }}
              className="ml-auto flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {query && (
              <FilterChip label={`"${query}"`} onRemove={() => setQuery("")} />
            )}
            {typeFilter && (
              <FilterChip label={typeFilter} onRemove={() => setTypeFilter("")} />
            )}
            {stateFilter && (
              <FilterChip label={stateFilter} onRemove={() => setStateFilter("")} />
            )}
            {sortBy !== "relevance" && (
              <FilterChip
                label={sortBy === "date_asc" ? "Date (earliest)" : "Date (latest)"}
                onRemove={() => setSortBy("relevance")}
              />
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="mt-4 text-sm text-muted">Finding races...</p>
          </div>
        ) : races.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted">
                <span className="font-semibold text-foreground">{races.length}</span>{" "}
                {races.length === 1 ? "race" : "races"} found
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {races.map((race) => (
                <RaceCard key={race.id} race={race} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <svg
                className="h-8 w-8 text-muted"
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
            <p className="mt-6 text-lg font-semibold text-foreground">No races found</p>
            <p className="mt-2 text-sm text-muted">
              {hasFilters
                ? "Try adjusting your search or filters"
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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
      {label}
      <button onClick={onRemove} className="hover:text-primary/80 transition-colors">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
