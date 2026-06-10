type AccentColorPickerProps = {
  selectedColor: string;
  selectedEnvironment: "deep-space" | "light-matter";
  onSelectColor: (color: string) => void;
};

const COLOR_OPTIONS = [
  { id: "green", hex: "#22c55e" },
  { id: "purple", hex: "#8b5cf6" },
  { id: "red", hex: "#ef4444" },
  { id: "white", hex: "#ffffff" },
] as const;

export function AccentColorPicker({
  selectedColor,
  selectedEnvironment,
  onSelectColor,
}: AccentColorPickerProps) {
  const visibleOptions = COLOR_OPTIONS.filter(
    (option) => !(option.id === "white" && selectedEnvironment === "deep-space"),
  );

  return (
    <section className="settings-block accent-card">
      <h3 className="settings-block-title">АКЦЕНТНЫЙ ЦВЕТ</h3>
      <div className="accent-row">
        {visibleOptions.map((option) => (
          <button
            key={option.id}
            className={`accent-dot ${selectedColor === option.id ? "active" : ""}`}
            style={{
              backgroundColor:
                option.id === "white" && selectedEnvironment === "deep-space"
                  ? "#ffffff"
                  : option.id === "white" && selectedEnvironment === "light-matter"
                    ? "#111111"
                    : option.hex,
            }}
            onClick={() => onSelectColor(option.id)}
            aria-label={`Выбрать акцент ${option.id}`}
          />
        ))}
      </div>
    </section>
  );
}
