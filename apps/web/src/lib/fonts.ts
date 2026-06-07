import { DEFAULT_FONT_FAMILY } from "@opentype/shared";

const FONT_URLS: Record<string, string> = {
  "JetBrains Mono": "JetBrains+Mono:wght@400;500",
  "Fira Code": "Fira+Code:wght@400;500",
  "Source Code Pro": "Source+Code+Pro:wght@400;500",
  "Roboto Mono": "Roboto+Mono:wght@400;500",
  Inconsolata: "Inconsolata:wght@400;500",
};

const FONT_LINKS: Record<string, string> = {
  "JetBrains Mono": "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap",
  "Fira Code": "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap",
  "Source Code Pro": "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap",
  "Roboto Mono": "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap",
  Inconsolata: "https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500&display=swap",
};

function findExistingLink(href: string): HTMLLinkElement | null {
  const links = document.querySelectorAll<HTMLLinkElement>("link[data-ot-font]");
  for (const link of Array.from(links)) {
    if (link.href === href) return link;
  }
  return null;
}

export function ensureFontLoaded(fontFamily: string): void {
  if (typeof document === "undefined") return;
  if (fontFamily === DEFAULT_FONT_FAMILY) return;

  const href = FONT_LINKS[fontFamily];
  if (!href) return;

  const fullHref = href.startsWith("http") ? href : `https://fonts.googleapis.com${href}`;
  if (findExistingLink(fullHref)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = fullHref;
  link.dataset.otFont = fontFamily;
  document.head.appendChild(link);
}

export function applyFontFamily(fontFamily: string): void {
  if (typeof document === "undefined") return;
  const value = FONT_URLS[fontFamily]
    ? `"${fontFamily}", ui-monospace, SFMono-Regular, monospace`
    : `${fontFamily}, ui-monospace, SFMono-Regular, monospace`;
  document.documentElement.style.setProperty("--font-typing", value);
}

export function applyFontSize(fontSize: string): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--font-size-typing", fontSize);
}

export function isKnownFont(fontFamily: string): boolean {
  return FONT_URLS[fontFamily] !== undefined;
}
