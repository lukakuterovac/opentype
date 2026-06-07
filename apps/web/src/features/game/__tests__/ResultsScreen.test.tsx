import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResultsScreen } from "../ResultsScreen";
import type { TestResult } from "../useTypingEngine";

function buildResult(overrides: Partial<TestResult> = {}): TestResult {
  return {
    grossWpm: 60,
    netWpm: 54,
    accuracy: 96,
    correctChars: 48,
    incorrectChars: 2,
    extraChars: 1,
    missedChars: 3,
    mode: "time",
    duration: 30,
    elapsedMs: 30_000,
    ...overrides,
  };
}

describe("ResultsScreen", () => {
  it("renders the net WPM number in tabular monospace and counts up to the result", async () => {
    render(
      <ResultsScreen
        result={buildResult({ netWpm: 72 })}
        onRetry={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const wpmEl = screen.getByLabelText("Net WPM 72");
    expect(wpmEl.className).toContain("results-wpm-number");
    expect(wpmEl.style.fontFamily).toContain("JetBrains Mono");
    expect(wpmEl.tagName.toLowerCase()).toBe("span");

    await waitFor(
      () => {
        expect(wpmEl.textContent).toBe("72");
      },
      { timeout: 2000 },
    );
  });

  it("clamps a negative net WPM to 0 in the display", async () => {
    render(
      <ResultsScreen
        result={buildResult({ netWpm: -12, grossWpm: 36 })}
        onRetry={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    await waitFor(
      () => {
        expect(screen.getByText("0")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it("renders the WPM label 'wpm' under the number", () => {
    render(
      <ResultsScreen
        result={buildResult()}
        onRetry={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const labels = screen.getAllByText("wpm");
    expect(labels.length).toBeGreaterThanOrEqual(1);
    const wpmLabel = labels[labels.length - 1];
    expect(wpmLabel?.className).toContain("results-wpm-label");
  });

  it("renders the secondary stat row with gross, accuracy, and characters", () => {
    render(
      <ResultsScreen
        result={buildResult({ grossWpm: 60, accuracy: 96 })}
        onRetry={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByText("gross")).toBeInTheDocument();
    expect(screen.getByText("acc")).toBeInTheDocument();
    expect(screen.getByText("characters")).toBeInTheDocument();
  });

  it("computes the total characters stat as correct + incorrect + extra", () => {
    render(
      <ResultsScreen
        result={buildResult({
          correctChars: 48,
          incorrectChars: 2,
          extraChars: 1,
          missedChars: 3,
        })}
        onRetry={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const charValue = screen.getByText("51");
    expect(charValue.className).toContain("stat-value");
  });

  it("renders the character breakdown line with all four counts", () => {
    render(
      <ResultsScreen
        result={buildResult({
          correctChars: 48,
          incorrectChars: 2,
          extraChars: 1,
          missedChars: 3,
        })}
        onRetry={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const breakdown = screen.getByText(
      "48 correct · 2 incorrect · 1 extra · 3 missed",
    );
    expect(breakdown.className).toContain("results-char-breakdown");
  });

  it("builds a time-mode tag as '<duration>s · <wordlist>'", () => {
    render(
      <ResultsScreen
        result={buildResult({ mode: "time", duration: 60 })}
        onRetry={vi.fn()}
        onNext={vi.fn()}
        wordlist="top 200"
      />,
    );

    expect(screen.getByText("60s · top 200")).toBeInTheDocument();
  });

  it("builds a words-mode tag as '<count> · <wordlist>'", () => {
    render(
      <ResultsScreen
        result={buildResult({ mode: "words", duration: 25 })}
        onRetry={vi.fn()}
        onNext={vi.fn()}
        wordlist="top 1000"
      />,
    );

    expect(screen.getByText("25 · top 1000")).toBeInTheDocument();
  });

  it("builds a quote-mode tag as 'quote · <wordlist>'", () => {
    render(
      <ResultsScreen
        result={buildResult({ mode: "quote", duration: 0 })}
        onRetry={vi.fn()}
        onNext={vi.fn()}
        wordlist="quotes"
      />,
    );

    expect(screen.getByText("quote · quotes")).toBeInTheDocument();
  });

  it("defaults the wordlist to 'top 200' when not provided", () => {
    render(
      <ResultsScreen
        result={buildResult({ mode: "time", duration: 30 })}
        onRetry={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByText("30s · top 200")).toBeInTheDocument();
  });

  it("renders retry and next test buttons", () => {
    render(
      <ResultsScreen
        result={buildResult()}
        onRetry={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const retry = screen.getByRole("button", { name: /retry/i });
    const next = screen.getByRole("button", { name: /next test/i });
    expect(retry).toBeInTheDocument();
    expect(next).toBeInTheDocument();
  });

  it("invokes onRetry when the retry button is clicked", () => {
    const onRetry = vi.fn();
    const onNext = vi.fn();
    render(
      <ResultsScreen
        result={buildResult()}
        onRetry={onRetry}
        onNext={onNext}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
  });

  it("invokes onNext when the next test button is clicked", () => {
    const onRetry = vi.fn();
    const onNext = vi.fn();
    render(
      <ResultsScreen
        result={buildResult()}
        onRetry={onRetry}
        onNext={onNext}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /next test/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it("does not show the personal best label by default", () => {
    render(
      <ResultsScreen
        result={buildResult()}
        onRetry={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.queryByText(/new personal best/i)).not.toBeInTheDocument();
  });

  it("shows the personal best label when isPersonalBest is true", () => {
    render(
      <ResultsScreen
        result={buildResult()}
        onRetry={vi.fn()}
        onNext={vi.fn()}
        isPersonalBest
      />,
    );

    const badge = screen.getByText(/new personal best/i);
    expect(badge.className).toContain("results-personal-best");
  });

  it("applies a custom font family to the large WPM number", () => {
    render(
      <ResultsScreen
        result={buildResult()}
        onRetry={vi.fn()}
        onNext={vi.fn()}
        fontFamily="Fira Code"
      />,
    );

    const wpmEl = screen.getByLabelText(/Net WPM/);
    expect(wpmEl.style.fontFamily).toContain("Fira Code");
  });

  it("exposes a dialog role for accessibility", () => {
    render(
      <ResultsScreen
        result={buildResult()}
        onRetry={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: /test results/i })).toBeInTheDocument();
  });
});
