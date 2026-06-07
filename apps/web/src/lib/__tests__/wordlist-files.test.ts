import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const PUBLIC_DIR = resolve(__dirname, "../../../public/wordlists");

function readList(filename: string): string[] {
  const raw = readFileSync(resolve(PUBLIC_DIR, filename), "utf-8");
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every((w) => typeof w === "string")) {
    throw new Error(`${filename} is not a string[]`);
  }
  return data as string[];
}

describe("public wordlists", () => {
  describe("top-200.json", () => {
    it("exists and is a non-empty string array", () => {
      const list = readList("top-200.json");
      expect(list.length).toBeGreaterThan(0);
    });

    it("contains exactly 200 unique entries", () => {
      const list = readList("top-200.json");
      expect(list).toHaveLength(200);
      expect(new Set(list).size).toBe(200);
    });

    it("contains only lowercase alphabetic words", () => {
      const list = readList("top-200.json");
      for (const w of list) {
        expect(w).toMatch(/^[a-z]+$/);
      }
    });
  });

  describe("top-1000.json", () => {
    it("contains exactly 1000 unique entries", () => {
      const list = readList("top-1000.json");
      expect(list).toHaveLength(1000);
      expect(new Set(list).size).toBe(1000);
    });

    it("contains only lowercase alphabetic words", () => {
      const list = readList("top-1000.json");
      for (const w of list) {
        expect(w).toMatch(/^[a-z]+$/);
      }
    });

    it("is a superset of top-200.json", () => {
      const top200 = readList("top-200.json");
      const top1000 = new Set(readList("top-1000.json"));
      for (const w of top200) {
        expect(top1000.has(w)).toBe(true);
      }
    });
  });

  describe("quotes.json", () => {
    it("is a non-empty string array", () => {
      const list = readList("quotes.json");
      expect(list.length).toBeGreaterThan(0);
    });

    it("contains only non-empty strings", () => {
      const list = readList("quotes.json");
      for (const q of list) {
        expect(q.trim().length).toBeGreaterThan(0);
      }
    });

    it("contains no duplicate entries", () => {
      const list = readList("quotes.json");
      expect(new Set(list).size).toBe(list.length);
    });
  });
});
