import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearWordListCache,
  DEFAULT_WORDLIST,
  DEFAULT_WORDLIST_FOR_MODE,
  isStringArray,
  isWordListId,
  loadWordList,
  pickRandomQuote,
  pickRandomWords,
  quoteToWords,
  WORDLIST_IDS,
  WORDLIST_LABELS,
} from "../wordlists";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function makeFetcher(payloads: Record<string, unknown>): typeof fetch {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    for (const [path, payload] of Object.entries(payloads)) {
      if (url.endsWith(path)) {
        return jsonResponse(payload);
      }
    }
    return jsonResponse({ error: "not found" }, 404);
  }) as unknown as typeof fetch;
}

describe("wordlists", () => {
  beforeEach(() => {
    clearWordListCache();
  });

  afterEach(() => {
    clearWordListCache();
  });

  describe("constants", () => {
    it("exposes the three expected wordlist ids", () => {
      expect(WORDLIST_IDS).toEqual(["top-200", "top-1000", "quotes"]);
    });

    it("defaults the wordlist to 'top-200'", () => {
      expect(DEFAULT_WORDLIST).toBe("top-200");
    });

    it("maps each mode to its default wordlist", () => {
      expect(DEFAULT_WORDLIST_FOR_MODE.time).toBe("top-200");
      expect(DEFAULT_WORDLIST_FOR_MODE.words).toBe("top-1000");
      expect(DEFAULT_WORDLIST_FOR_MODE.quote).toBe("quotes");
    });

    it("provides a human-readable label for each wordlist", () => {
      expect(WORDLIST_LABELS["top-200"]).toBe("top 200");
      expect(WORDLIST_LABELS["top-1000"]).toBe("top 1000");
      expect(WORDLIST_LABELS.quotes).toBe("quotes");
    });
  });

  describe("isWordListId", () => {
    it("returns true for known ids", () => {
      expect(isWordListId("top-200")).toBe(true);
      expect(isWordListId("top-1000")).toBe(true);
      expect(isWordListId("quotes")).toBe(true);
    });

    it("returns false for unknown ids", () => {
      expect(isWordListId("top-5000")).toBe(false);
      expect(isWordListId("")).toBe(false);
      expect(isWordListId("nonsense")).toBe(false);
    });
  });

  describe("isStringArray", () => {
    it("returns true for arrays of strings", () => {
      expect(isStringArray([])).toBe(true);
      expect(isStringArray(["a", "b", "c"])).toBe(true);
    });

    it("returns false for arrays with non-strings", () => {
      expect(isStringArray(["a", 1])).toBe(false);
      expect(isStringArray([null])).toBe(false);
    });

    it("returns false for non-arrays", () => {
      expect(isStringArray("hello")).toBe(false);
      expect(isStringArray(null)).toBe(false);
      expect(isStringArray(undefined)).toBe(false);
      expect(isStringArray({ 0: "a" })).toBe(false);
    });
  });

  describe("loadWordList", () => {
    it("fetches the json file at the expected path", async () => {
      const fetcher = makeFetcher({
        "top-200.json": ["a", "b", "c"],
      });
      const list = await loadWordList("top-200", fetcher);
      expect(list).toEqual(["a", "b", "c"]);
      const call = (fetcher as unknown as { mock: { calls: unknown[][] } }).mock
        .calls[0];
      const url = call?.[0] as string;
      expect(url).toBe("/wordlists/top-200.json");
    });

    it("caches the result and reuses it on subsequent calls", async () => {
      const fetcher = makeFetcher({
        "top-200.json": ["x", "y"],
      });
      await loadWordList("top-200", fetcher);
      await loadWordList("top-200", fetcher);
      await loadWordList("top-200", fetcher);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("does not share cache between wordlist ids", async () => {
      const fetcher = makeFetcher({
        "top-200.json": ["a"],
        "quotes.json": ["b"],
      });
      await loadWordList("top-200", fetcher);
      await loadWordList("quotes", fetcher);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("throws when the response is not ok", async () => {
      const fetcher = makeFetcher({});
      await expect(loadWordList("top-200", fetcher)).rejects.toThrow(
        /Failed to load wordlist top-200: 404/,
      );
    });

    it("throws when the response body is not a string array", async () => {
      const fetcher = makeFetcher({ "top-200.json": { wrong: "shape" } });
      await expect(loadWordList("top-200", fetcher)).rejects.toThrow(
        /Invalid wordlist top-200/,
      );
    });

    it("clearWordListCache forces a re-fetch", async () => {
      const fetcher = makeFetcher({
        "top-200.json": ["a", "b"],
      });
      await loadWordList("top-200", fetcher);
      clearWordListCache();
      await loadWordList("top-200", fetcher);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });

  describe("pickRandomWords", () => {
    const sample = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

    it("returns the requested number of words", () => {
      const picked = pickRandomWords(sample, 5);
      expect(picked).toHaveLength(5);
    });

    it("returns all unique entries from the source list", () => {
      const picked = pickRandomWords(sample, 10);
      expect(picked).toHaveLength(10);
      expect(new Set(picked).size).toBe(10);
      for (const w of picked) {
        expect(sample).toContain(w);
      }
    });

    it("returns an empty array when count is 0", () => {
      expect(pickRandomWords(sample, 0)).toEqual([]);
    });

    it("returns the whole list when count equals its length", () => {
      const picked = pickRandomWords(sample, sample.length);
      expect(picked).toHaveLength(sample.length);
      expect(new Set(picked).size).toBe(sample.length);
    });

    it("throws on negative count", () => {
      expect(() => pickRandomWords(sample, -1)).toThrow();
    });

    it("throws on non-integer count", () => {
      expect(() => pickRandomWords(sample, 1.5)).toThrow();
    });

    it("throws when count exceeds list length", () => {
      expect(() => pickRandomWords(sample, 11)).toThrow();
    });

    it("uses the injected random for deterministic output", () => {
      const random = (): number => 0;
      const picked = pickRandomWords(sample, 3, random);
      expect(picked).toEqual(["a", "b", "c"]);
    });

    it("does not mutate the input list", () => {
      const copy = sample.slice();
      pickRandomWords(sample, 5);
      expect(sample).toEqual(copy);
    });
  });

  describe("pickRandomQuote", () => {
    const quotes = [
      "quote one",
      "quote two",
      "quote three",
    ];

    it("returns an element of the list", () => {
      const pick = pickRandomQuote(quotes);
      expect(quotes).toContain(pick);
    });

    it("returns the first element when random is 0", () => {
      const pick = pickRandomQuote(quotes, () => 0);
      expect(pick).toBe("quote one");
    });

    it("returns the last element when random is just below 1", () => {
      const pick = pickRandomQuote(quotes, () => 0.999);
      expect(pick).toBe("quote three");
    });

    it("throws when the list is empty", () => {
      expect(() => pickRandomQuote([])).toThrow(/empty/);
    });
  });

  describe("quoteToWords", () => {
    it("splits a quote on whitespace", () => {
      expect(quoteToWords("the only way is forward")).toEqual([
        "the",
        "only",
        "way",
        "is",
        "forward",
      ]);
    });

    it("collapses multiple spaces", () => {
      expect(quoteToWords("a   b\nc\td")).toEqual(["a", "b", "c", "d"]);
    });

    it("returns an empty array for an empty string", () => {
      expect(quoteToWords("")).toEqual([]);
      expect(quoteToWords("   ")).toEqual([]);
    });
  });
});
