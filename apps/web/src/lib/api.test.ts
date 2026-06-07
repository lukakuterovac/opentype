import { describe, expect, it } from "vitest";
import { TEST_MODES, DEFAULT_TIME_DURATION } from "@opentype/shared";
import { api } from "./api";

describe("scaffold", () => {
  it("exports shared constants", () => {
    expect(TEST_MODES).toEqual(["time", "words", "quote"]);
    expect(DEFAULT_TIME_DURATION).toBe(30);
  });

  it("creates an axios instance", () => {
    expect(api.defaults.headers["Content-Type"]).toBe("application/json");
  });
});
