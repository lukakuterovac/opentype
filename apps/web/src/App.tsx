import { Route, Routes } from "react-router-dom";
import { Nav } from "./components/Nav";
import { TestPage } from "./pages/TestPage";
import { SettingsPage } from "./pages/SettingsPage";

export function App(): JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <Nav />
      <Routes>
        <Route path="/" element={<TestPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}
