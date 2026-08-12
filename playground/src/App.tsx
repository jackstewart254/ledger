import { useEffect, useState } from "react";
import "@mcleanstewart/ledger/styles.css";
import "./app.css";
import CoreSection from "./sections/CoreSection";
import TypographySection from "./sections/TypographySection";
import LayoutSection from "./sections/LayoutSection";
import NavigationSection from "./sections/NavigationSection";
import FormsSection from "./sections/FormsSection";
import DataSection from "./sections/DataSection";
import FeedbackSection from "./sections/FeedbackSection";

// Anchor ids must match the id each section file sets on its <section> root.
const NAV = [
  { id: "core", label: "Core" },
  { id: "typography", label: "Typography" },
  { id: "layout", label: "Layout" },
  { id: "navigation", label: "Navigation" },
  { id: "forms", label: "Forms" },
  { id: "data", label: "Data" },
  { id: "feedback", label: "Feedback" },
] as const;

type Theme = "dark" | "light";
const THEME_KEY = "ui-designs-theme";

export default function App() {
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="pg-shell">
      <nav className="pg-nav">
        <span className="pg-nav-brand">ledger</span>
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
        <FeedbackSection />
      </main>
    </div>
  );
}
