import type { ReactNode } from "react";
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

export function TypingArea({
  words,
  wordIndex,
  caretStyle,
  smoothCaret,
  fontFamily,
  fontSize,
}: TypingAreaProps): JSX.Element {
  const showCaret = caretStyle !== "off" && wordIndex < words.length;
  const caretClass = [
    "caret",
    caretStyle !== "off" ? `caret-${caretStyle}` : "",
    smoothCaret ? "caret-smooth" : "caret-blink",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="typing-area" style={{ fontFamily, fontSize }}>
      {words.map((word, wi) => {
        const isActive = wi === wordIndex;
        const caretAt =
          isActive && showCaret
            ? Math.min(word.chars.length, word.target.length)
            : -1;
        const nodes: ReactNode[] = [];
        if (word.chars.length === 0) {
          nodes.push(
            <span key="ph" className="char-placeholder">
              {"\u200B"}
            </span>,
          );
        }
        word.chars.forEach((ch, ci) => {
          if (ci === caretAt) {
            nodes.push(
              <span
                key={`caret-${ci}`}
                className={caretClass}
                data-word-index={wi}
                data-char-index={ci}
              />,
            );
          }
          nodes.push(
            <span
              key={`char-${ci}`}
              className={`char ${ch.status}`}
              data-word-index={wi}
              data-char-index={ci}
            >
              {ch.target || (ch.typed !== null ? ch.typed : "\u200B")}
            </span>,
          );
        });
        if (caretAt >= word.chars.length) {
          nodes.push(
            <span
              key="caret-end"
              className={caretClass}
              data-word-index={wi}
              data-char-index={caretAt}
            />,
          );
        }
        return (
          <span key={wi} className="word" data-word-index={wi}>
            {nodes}
          </span>
        );
      })}
    </div>
  );
}
