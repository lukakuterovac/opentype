import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { SettingsPage } from "../../../pages/SettingsPage";
import { useSettingsStore, defaultSettings } from "../../../store/settingsStore";
import { useThemeStore } from "../../../store/themeStore";

function resetStores(): void {
  useSettingsStore.setState(defaultSettings());
  useThemeStore.setState({
    activeThemeId: "default-dark",
    customThemes: [],
    setTheme: useThemeStore.getState().setTheme,
    saveCustomTheme: useThemeStore.getState().saveCustomTheme,
    deleteCustomTheme: useThemeStore.getState().deleteCustomTheme,
  });
  localStorage.clear();
}

function renderPage(): void {
  render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>,
  );
}

describe("SettingsPage", () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    resetStores();
  });

  it("renders the page title and subtitle", () => {
    renderPage();
    expect(screen.getByText("settings")).toBeInTheDocument();
    expect(
      screen.getByText(/All settings are saved automatically to your browser\./),
    ).toBeInTheDocument();
  });

  it("renders all four section titles", () => {
    renderPage();
    const titles = screen.getAllByRole("heading", { level: 2 });
    const titleTexts = titles.map((t) => t.textContent);
    expect(titleTexts).toContain("theme");
    expect(titleTexts).toContain("random theme");
    expect(titleTexts).toContain("appearance");
    expect(titleTexts).toContain("behaviour");
  });

  it("renders preset theme swatches grouped by dark/light", () => {
    renderPage();
    expect(screen.getByText("Default Dark")).toBeInTheDocument();
    expect(screen.getByText("Serika Dark")).toBeInTheDocument();
    expect(screen.getAllByText("Light").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Serika")).toBeInTheDocument();
  });

  it("applies a theme when a swatch is clicked", () => {
    renderPage();
    const serika = screen.getByRole("button", { name: /Apply Serika Dark theme/i });
    fireEvent.click(serika);
    expect(useSettingsStore.getState().activeThemeId).toBe("serika-dark");
  });

  it("toggles a theme as a favorite", () => {
    renderPage();
    const favButton = screen.getByRole("button", {
      name: /Add Default Dark to favorites/i,
    });
    fireEvent.click(favButton);
    expect(useSettingsStore.getState().favoriteThemeIds).toContain("default-dark");
  });

  it("shows a Favorites group when at least one theme is favorited", () => {
    useSettingsStore.setState({ favoriteThemeIds: ["serika-dark"] });
    renderPage();
    expect(screen.getByText("Favorites")).toBeInTheDocument();
  });

  it("updates font family via the appearance select", () => {
    renderPage();
    const row = screen.getByText("font family").closest(".settings-row");
    expect(row).not.toBeNull();
    const fira = within(row!).getByRole("button", { name: "Fira Code" });
    fireEvent.click(fira);
    expect(useSettingsStore.getState().fontFamily).toBe("Fira Code");
  });

  it("updates caret style via the appearance select", () => {
    renderPage();
    const row = screen.getByText("caret style").closest(".settings-row");
    expect(row).not.toBeNull();
    const block = within(row!).getByRole("button", { name: "block" });
    fireEvent.click(block);
    expect(useSettingsStore.getState().caretStyle).toBe("block");
  });

  it("toggles a behaviour switch", () => {
    renderPage();
    const row = screen.getByText("quick restart").closest(".settings-row");
    expect(row).not.toBeNull();
    const toggle = within(row!).getByRole("switch");
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(toggle);
    expect(useSettingsStore.getState().quickRestart).toBe(true);
  });

  it("opens the custom theme editor with the 'create custom theme' button", () => {
    renderPage();
    const button = screen.getByRole("button", { name: /\+ create custom theme/i });
    fireEvent.click(button);
    expect(screen.getByText("Create custom theme")).toBeInTheDocument();
    expect(screen.getByText("Background")).toBeInTheDocument();
    expect(screen.getByText("Accent")).toBeInTheDocument();
  });

  it("exposes 15 color rows in the custom theme editor", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /\+ create custom theme/i }));
    const colorRows = document.querySelectorAll(".custom-theme-color-row");
    expect(colorRows.length).toBe(15);
  });

  it("persists changes to localStorage via the opentype-settings key", () => {
    renderPage();
    const row = screen.getByText("blind mode").closest(".settings-row");
    const toggle = within(row!).getByRole("switch");
    fireEvent.click(toggle);
    const stored = JSON.parse(localStorage.getItem("opentype-settings") ?? "{}");
    expect(stored.blindMode).toBe(true);
  });

  it("updates random theme via the dedicated section", () => {
    renderPage();
    const row = screen
      .getByText("random theme on test complete")
      .closest(".settings-row");
    expect(row).not.toBeNull();
    const allButton = within(row!).getByRole("button", { name: "all" });
    fireEvent.click(allButton);
    expect(useSettingsStore.getState().randomTheme).toBe("all");
  });
});
