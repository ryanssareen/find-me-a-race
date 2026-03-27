const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const MONTH_ABBREVS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

const FILLER_WORDS = new Set([
  "in", "races", "race", "during", "for", "of", "the", "runs", "running",
]);

/** Match a word to a month — supports full names, abbreviations, and partial typing (3+ chars) */
function matchMonth(word: string): number | null {
  // Exact abbreviation match
  if (MONTH_ABBREVS[word] !== undefined) return MONTH_ABBREVS[word];

  // Full name match
  const fullIdx = MONTH_NAMES.indexOf(word);
  if (fullIdx !== -1) return fullIdx;

  // Prefix match (3+ chars) — "octo", "novem", "septe" etc.
  if (word.length >= 3) {
    const match = MONTH_NAMES.find((m) => m.startsWith(word));
    if (match) return MONTH_NAMES.indexOf(match);
  }

  return null;
}

export function parseDate(query: string): {
  month: number | null;
  year: number | null;
  remainingQuery: string;
} {
  const words = query.split(/\s+/);
  let month: number | null = null;
  let year: number | null = null;
  const remaining: string[] = [];

  for (const word of words) {
    const clean = word.replace(/[,]/g, "");
    if (month === null) {
      const m = matchMonth(clean);
      if (m !== null) {
        month = m;
        continue;
      }
    }
    if (/^20\d{2}$/.test(clean) && year === null) {
      year = parseInt(clean, 10);
    } else if (!FILLER_WORDS.has(clean)) {
      remaining.push(word);
    }
  }

  return { month, year, remainingQuery: remaining.join(" ").trim() };
}
