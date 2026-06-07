import { useLayoutEffect, useRef, useState } from "react";
import type { WordState } from "./useTypingEngine";

export type CaretStyle = "line" | "block" | "underline" | "off";

export interface TypingAreaProps {
  words: WordState[];
  wordIndex: number;
  caretStyle: CaretStyle;
  smoothCaret: boolean;
  fontFamily: string;
  fontSize: string;
}

interface CaretPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ZERO_POSITION: CaretPosition = { x: 0, y: 0, width: 0, height: 0 };

export function TypingArea({
  words,
  wordIndex,
  caretStyle,
  smoothCaret,
  fontFamily,
  fontSize,
}: TypingAreaProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const charRef = useRef<HTMLSpanElement | null>(null);
  const [position, setPosition] = useState<CaretPosition>(ZERO_POSITION);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (caretStyle === "off") return;

    const update = (): void => {
      const charEl = charRef.current;
      if (!charEl) {
        setPosition(ZERO_POSITION);
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const charRect = charEl.getBoundingClientRect();
      const x = charRect.left - containerRect.left;
      const y = charRect.top - containerRect.top;
      setPosition({ x, y, width: charRect.width, height: charRect.height });
    };

    update();
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (observer && charRef.current) observer.observe(charRef.current);
    return () => {
      observer?.disconnect();
    };
  }, [words, wordIndex, caretStyle, fontFamily, fontSize]);

  const activeWord = words[wordIndex];
  const charIndex = activeWord?.chars.length ?? 0;
  const showCaret = caretStyle !== "off" && wordIndex < words.length;
  const caretClass = [
    "caret",
    caretStyle !== "off" ? caretStyle : "",
    smoothCaret ? "smooth" : "blink",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={containerRef}
      className="typing-area"
      style={{ fontFamily, fontSize }}
    >
      {words.map((word, wi) => (
        <span key={wi} className="word" data-word-index={wi}>
          {word.chars.map((ch, ci) => {
            const isCaretAnchor =
              wi === wordIndex && ci === Math.min(charIndex, word.chars.length);
            return (
              <span
                key={ci}
                ref={isCaretAnchor ? charRef : undefined}
                className={`char ${ch.status}`}
                data-word-index={wi}
                data-char-index={ci}
              >
                {ch.target || (ch.typed !== null ? ch.typed : "\u200B")}
              </span>
            );
          })}
          {word.chars.length === 0 && wi === wordIndex && (
            <span ref={charRef} className="char untyped" data-word-index={wi} data-char-index={0}>
              {"\u200B"}
            </span>
          )}
        </span>
      ))}
      {showCaret && (
        <div
          className={caretClass}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            ...(caretStyle === "block" || caretStyle === "underline"
              ? { width: position.width }
              : {}),
            ...(caretStyle === "underline"
              ? { transform: `translate(${position.x}px, ${position.y + position.height - 2}px)` }
              : {}),
          }}
        />
      )}
    </div>
  );
}
