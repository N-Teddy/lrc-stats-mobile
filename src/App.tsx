import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "./store/ThemeContext";

function App() {
  const { t } = useTranslation();
  const { theme, toggleTheme, accentColor } = useTheme();

  return (
    <div className="safe-top safe-bottom" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="glass" style={{
        height: "var(--header-height)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        paddingTop: "var(--safe-area-top)",
        justifyContent: "space-between"
      }}>
        <h1 className="font-technical" style={{ fontSize: "1.2rem", color: accentColor }}>
          LRC STATS MOBILE
        </h1>
        <button className="touch-active" onClick={toggleTheme} style={{ fontSize: "0.8rem", opacity: 0.8 }}>
          {theme.toUpperCase()}
        </button>
      </header>

      <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <div className="animate-in" style={{ padding: "20px", borderRadius: "var(--radius-lg)", background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
          <h2 className="gradient-text" style={{ marginBottom: "10px" }}>
            {t("dashboard.title")}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {t("dashboard.subtitle")}
          </p>
        </div>

        <div className="animate-in stagger-1" style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div className="glass" style={{ padding: "15px", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>{t("dashboard.active_members")}</span>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>--</span>
          </div>
          <div className="glass" style={{ padding: "15px", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>{t("dashboard.average_attendance")}</span>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>--</span>
          </div>
        </div>
      </main>

      <nav className="glass" style={{
        height: "var(--nav-bar-height)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        paddingBottom: "var(--safe-area-bottom)",
        borderTop: "1px solid var(--glass-border)"
      }}>
        <button className="touch-active" style={{ color: accentColor }}>{t("sidebar.dashboard")}</button>
        <button className="touch-active" style={{ opacity: 0.5 }}>{t("sidebar.directory")}</button>
        <button className="touch-active" style={{ opacity: 0.5 }}>{t("sidebar.activities")}</button>
        <button className="touch-active" style={{ opacity: 0.5 }}>{t("sidebar.settings")}</button>
      </nav>
    </div>
  );
}

export default App;
