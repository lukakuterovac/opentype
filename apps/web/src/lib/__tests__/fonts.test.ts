import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyFontFamily, applyFontSize, ensureFontLoaded, isKnownFont } from "../fonts";

describe("fonts", () => {
  beforeEach(() => {
    document.head
      .querySelectorAll("link[data-ot-font]")
      .forEach((node) => node.remove());
    document.documentElement.style.removeProperty("--font-typing");
    document.documentElement.style.removeProperty("--font-size-typing");
  });

  afterEach(() => {
    document.head
      .querySelectorAll("link[data-ot-font]")
      .forEach((node) => node.remove());
  });

  describe("isKnownFont", () => {
    it("returns true for fonts in the catalog", () => {
      expect(isKnownFont("JetBrains Mono")).toBe(true);
      expect(isKnownFont("Fira Code")).toBe(true);
      expect(isKnownFont("Roboto Mono")).toBe(true);
    });

    it("returns false for unknown fonts", () => {
      expect(isKnownFont("Comic Sans MS")).toBe(false);
    });
  });

  describe("applyFontFamily", () => {
    it("sets the --font-typing CSS variable on the document root", () => {
      applyFontFamily("Fira Code");
      const value = document.documentElement.style.getPropertyValue("--font-typing");
      expect(value).toContain("Fira Code");
    });

    it("does not throw in a non-browser environment", () => {
      const originalDocument = (globalThis as { document?: Document }).document;
      (globalThis as { document?: Document }).document = undefined;
      try {
        expect(() => applyFontFamily("Fira Code")).not.toThrow();
        expect(() => applyFontSize("22px")).not.toThrow();
        expect(() => ensureFontLoaded("Fira Code")).not.toThrow();
      } finally {
        (globalThis as { document?: Document }).document = originalDocument;
      }
    });
  });

  describe("applyFontSize", () => {
    it("sets the --font-size-typing CSS variable on the document root", () => {
      applyFontSize("22px");
      const value = document.documentElement.style.getPropertyValue("--font-size-typing");
      expect(value).toBe("22px");
    });
  });

  describe("ensureFontLoaded", () => {
    it("does not inject a link for the default font (already loaded)", () => {
      ensureFontLoaded("JetBrains Mono");
      const links = document.head.querySelectorAll("link[data-ot-font]");
      expect(links).toHaveLength(0);
    });

    it("injects a stylesheet link for a non-default font", () => {
      ensureFontLoaded("Fira Code");
      const links = document.head.querySelectorAll("link[data-ot-font]");
      expect(links.length).toBeGreaterThanOrEqual(1);
      const href = (links[0] as HTMLLinkElement).href;
      expect(href).toContain("Fira+Code");
    });

    it("does not inject duplicate links for the same font", () => {
      ensureFontLoaded("Fira Code");
      ensureFontLoaded("Fira Code");
      const links = document.head.querySelectorAll("link[data-ot-font]");
      expect(links).toHaveLength(1);
    });

    it("handles unknown fonts gracefully", () => {
      expect(() => ensureFontLoaded("Definitely Not A Real Font")).not.toThrow();
    });
  });
});
