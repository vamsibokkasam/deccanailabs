import TerminalCard from "./TerminalCard";

export default function StepCard({ stage: item, active, dimmed }) {
  return (
    <article
      className={`scroll-hero-card scroll-hero-card--${item.id}${active ? " is-active" : ""}${dimmed ? " is-dim" : ""}`}
    >
      <p className="scroll-hero-kicker">{item.kicker}</p>
      <h3 className="scroll-hero-card-title">{item.title}</h3>
      <p className="scroll-hero-card-detail">{item.detail}</p>
      {item.terminal ? <TerminalCard active={active} /> : null}
      {item.badge && active ? <p className="scroll-hero-badge">{item.badge}</p> : null}
    </article>
  );
}
