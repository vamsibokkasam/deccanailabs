import { useEffect, useState } from "react";

const COMMAND = "npm run build";

export default function TerminalCard({ active }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    if (count >= COMMAND.length) return undefined;
    const timer = window.setTimeout(() => setCount((value) => value + 1), 48);
    return () => window.clearTimeout(timer);
  }, [active, count]);

  useEffect(() => {
    if (active) return undefined;
    const timer = window.setTimeout(() => setCount(0), 0);
    return () => window.clearTimeout(timer);
  }, [active]);

  const shown = active ? COMMAND.slice(0, count) : "";
  const ready = active && count >= COMMAND.length;

  return (
    <pre className="scroll-hero-terminal">
      <span>decco@labs:~$ {shown}</span>
      {active && !ready ? <span className="scroll-hero-caret" aria-hidden="true" /> : null}
      {ready ? <span className="scroll-hero-ready">{"\n"}✓ project ready</span> : null}
    </pre>
  );
}
