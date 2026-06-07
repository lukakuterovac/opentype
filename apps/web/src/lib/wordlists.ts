import type { TestMode } from "@opentype/shared";

export const WORDLIST_IDS = ["top-200", "top-1000", "quotes"] as const;
export type WordListId = (typeof WORDLIST_IDS)[number];

export const DEFAULT_WORDLIST: WordListId = "top-200";

const WORDLIST_PATHS: Record<WordListId, string> = {
  "top-200": "/wordlists/top-200.json",
  "top-1000": "/wordlists/top-1000.json",
  quotes: "/wordlists/quotes.json",
};

export const WORDLIST_LABELS: Record<WordListId, string> = {
  "top-200": "top 200",
  "top-1000": "top 1000",
  quotes: "quotes",
};

export const DEFAULT_WORDLIST_FOR_MODE: Record<TestMode, WordListId> = {
  time: "top-200",
  words: "top-1000",
  quote: "quotes",
};

const cache = new Map<WordListId, string[]>();

export type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export function isWordListId(value: string): value is WordListId {
  return (WORDLIST_IDS as readonly string[]).includes(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

export function clearWordListCache(): void {
  cache.clear();
}

export async function loadWordList(
  id: WordListId,
  fetcher: Fetcher = fetch,
): Promise<string[]> {
  const cached = cache.get(id);
  if (cached) return cached;
  const res = await fetcher(WORDLIST_PATHS[id]);
  if (!res.ok) {
    throw new Error(`Failed to load wordlist ${id}: ${res.status}`);
  }
  const data: unknown = await res.json();
  if (!isStringArray(data)) {
    throw new Error(`Invalid wordlist ${id}: expected string[]`);
  }
  cache.set(id, data);
  return data;
}

export type RandomFn = () => number;

export function pickRandomWords(
  list: readonly string[],
  count: number,
  random: RandomFn = Math.random,
): string[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("count must be a non-negative integer");
  }
  if (count > list.length) {
    throw new Error(
      `count (${count}) exceeds wordlist length (${list.length})`,
    );
  }
  if (count === 0) return [];
  const pool = list.slice();
  for (let i = 0; i < count; i += 1) {
    const range = pool.length - i;
    const j = i + Math.floor(random() * range);
    if (j !== i) {
      const tmp = pool[i] as string;
      pool[i] = pool[j] as string;
      pool[j] = tmp;
    }
  }
  return pool.slice(0, count);
}

export function pickRandomQuote(
  list: readonly string[],
  random: RandomFn = Math.random,
): string {
  if (list.length === 0) {
    throw new Error("quote list is empty");
  }
  const idx = Math.floor(random() * list.length);
  const pick = list[idx];
  if (pick === undefined) {
    throw new Error("quote list index out of bounds");
  }
  return pick;
}

export function quoteToWords(quote: string): string[] {
  return quote.split(/\s+/).filter((w) => w.length > 0);
}
