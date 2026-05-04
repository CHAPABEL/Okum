import { Moon, Sun } from "lucide-react";

type EnvironmentSelectorProps = {
  selectedEnvironment: "deep-space" | "light-matter";
  onSelectEnvironment: (env: "deep-space" | "light-matter") => void;
};

export function EnvironmentSelector({ selectedEnvironment, onSelectEnvironment }: EnvironmentSelectorProps) {
  return (
    <section className="settings-block environment-card">
      <h3 className="settings-block-title">ENVIRONMENT</h3>
      <div className="environment-row">
        <button
          className={`environment-option ${selectedEnvironment === "deep-space" ? "active" : ""}`}
          onClick={() => onSelectEnvironment("deep-space")}
        >
          <Moon size={16} />
          <span>Deep Space</span>
        </button>
        <button
          className={`environment-option ${selectedEnvironment === "light-matter" ? "active" : ""}`}
          onClick={() => onSelectEnvironment("light-matter")}
        >
          <Sun size={16} />
          <span>Light Matter</span>
        </button>
      </div>
    </section>
  );
}
