import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { IconButton, SegmentedControl } from "@mcleanstewart/ledger";
import "@mcleanstewart/ledger/styles.css";
import "./app.css";
import Dashboard from "./Dashboard";
import CoreSection from "./sections/CoreSection";
import TypographySection from "./sections/TypographySection";
import LayoutSection from "./sections/LayoutSection";
import NavigationSection from "./sections/NavigationSection";
import FormsSection from "./sections/FormsSection";
import DataSection from "./sections/DataSection";
import ChartsSection from "./sections/ChartsSection";
import FeedbackSection from "./sections/FeedbackSection";
import KpiLabA from "./sections/KpiLabA";
import KpiLabB from "./sections/KpiLabB";
import KpiLabC from "./sections/KpiLabC";
import KpiLabD from "./sections/KpiLabD";
import KpiLabE from "./sections/KpiLabE";

// Anchor ids must match the id each section file sets on its <section> root.
const NAV = [
  { id: "core", label: "Core" },
  { id: "typography", label: "Typography" },
  { id: "layout", label: "Layout" },
  { id: "navigation", label: "Navigation" },
  { id: "forms", label: "Forms" },
  { id: "data", label: "Data" },
  { id: "charts", label: "Charts" },
  { id: "feedback", label: "Feedback" },
  { id: "kpi-lab-a", label: "KPI lab A" },
  { id: "kpi-lab-b", label: "KPI lab B" },
  { id: "kpi-lab-c", label: "KPI lab C" },
  { id: "kpi-lab-d", label: "KPI lab D" },
  { id: "kpi-lab-e", label: "KPI lab E" },
] as const;

type Theme = "dark" | "light";
const THEME_KEY = "ui-designs-theme";

const VIEWS = [
  { value: "gallery", label: "Gallery" },
  { value: "dashboard", label: "Dashboard" },
];

export default function App() {
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark",
  );
  const [view, setView] = useState("gallery");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  if (view === "dashboard") {
    return (
      <Dashboard
        toolbar={
          <>
            <SegmentedControl
              options={VIEWS}
              value={view}
              onChange={setView}
              aria-label="Playground view"
            />
            <IconButton
              icon={theme === "dark" ? Sun : Moon}
              label={theme === "dark" ? "Light mode" : "Dark mode"}
              onClick={toggleTheme}
            />
          </>
        }
      />
    );
  }

  return (
    <div className="pg-shell">
      <nav className="pg-nav">
        <span className="pg-nav-brand">ledger</span>
        <SegmentedControl
          options={VIEWS}
          value={view}
          onChange={setView}
          aria-label="Playground view"
          className="pg-nav-switch"
        />
        {NAV.map(({ id, label }) => (
          <a key={id} className="pg-nav-link" href={`#${id}`}>
            {label}
          </a>
        ))}
        <button
          type="button"
          className="pg-theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </nav>
      <main className="pg-main">
        <CoreSection />
        <TypographySection />
        <LayoutSection />
        <NavigationSection />
        <FormsSection />
        <DataSection />
        <ChartsSection />
        <FeedbackSection />
        <KpiLabA />
        <KpiLabB />
        <KpiLabC />
        <KpiLabD />
        <KpiLabE />
      </main>
    </div>
  );
}
