import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { inputClass } from "../utils/themeClasses";

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOption = (option) => {
    onChange({ target: { name, value: option } });
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
        <span className={value ? "text-fg" : "text-subtle"}>
          {value || placeholder}
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
          {options.map((option) => (
            <li key={option} role="option" aria-selected={value === option}>
              <button
                type="button"
                onClick={() => selectOption(option)}
                className={`w-full px-4 py-3 text-left text-[15px] transition ${
                  value === option
                    ? "bg-accent/15 text-accent font-medium"
                    : "text-fg hover:bg-white/5"
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SelectField;
