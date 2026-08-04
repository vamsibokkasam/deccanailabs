import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { inputClass } from "../utils/themeClasses";

function normalizeOptions(options) {
  return (options || []).map((option) => {
    if (option && typeof option === "object") {
      return {
        value: String(option.value ?? ""),
        label: String(option.label ?? option.value ?? ""),
      };
    }

    return {
      value: String(option ?? ""),
      label: String(option ?? ""),
    };
  });
}

function SelectField({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  hasError = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const normalized = normalizeOptions(options);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = normalized.find((option) => option.value === String(value ?? ""));
  const displayLabel = selected?.label || "";

  const selectOption = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${inputClass(hasError)} flex items-center justify-between gap-3 text-left`}
      >
        <span className={displayLabel ? "text-fg" : "text-subtle"}>
          {displayLabel || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-2 w-full max-h-52 overflow-y-auto rounded-lg border border-border bg-surface shadow-xl"
        >
          {normalized.map((option) => (
            <li
              key={option.value || "__empty"}
              role="option"
              aria-selected={String(value ?? "") === option.value}
            >
              <button
                type="button"
                onClick={() => selectOption(option.value)}
                className={`w-full px-4 py-3 text-left text-[15px] transition ${
                  String(value ?? "") === option.value
                    ? "bg-accent/15 text-accent font-medium"
                    : "text-fg hover:bg-white/5"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SelectField;
