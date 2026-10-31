import { STAGES } from "./heroStory";

export default function StageDots({ stage, onSelect }) {
  return (
    <nav className="scroll-hero-dots" aria-label="Story progress">
      {STAGES.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className="scroll-hero-dot"
          aria-current={index === stage ? "step" : undefined}
          aria-label={`${item.label} ${item.title}`}
          onClick={() => onSelect(index)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
