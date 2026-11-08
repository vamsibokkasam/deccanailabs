import { Brain, LayoutTemplate, Smartphone, Sparkles } from "lucide-react";

const cards = [
  { label: "Web", Icon: LayoutTemplate, delay: "0s" },
  { label: "Design", Icon: Sparkles, delay: "0.35s" },
  { label: "Apps", Icon: Smartphone, delay: "0.7s" },
  { label: "AI", Icon: Brain, delay: "1.05s" },
];

function ServicesVisual() {
  return (
    <div className="svc-visual svc-visual--services">
      <div className="svc-visual-stage" aria-hidden="true">
        <div className="svc-visual-glow" />
        <div className="svc-visual-panel svc-visual-panel--main">
          <div className="svc-visual-window-bar">
            <span /><span /><span />
          </div>
          <div className="svc-visual-window-body">
            <div className="svc-visual-skeleton svc-visual-skeleton--title" />
            <div className="svc-visual-skeleton svc-visual-skeleton--line" />
            <div className="svc-visual-skeleton svc-visual-skeleton--line short" />
            <div className="svc-visual-grid-mini">
              <span /><span /><span /><span />
            </div>
          </div>
        </div>

        {cards.map(({ label, Icon, delay }) => (
          <div
            key={label}
            className="svc-float-card"
            style={{ animationDelay: delay }}
          >
            <span className="svc-float-card-icon">
              <Icon size={16} strokeWidth={1.8} />
            </span>
            <span>{label}</span>
          </div>
        ))}

        <div className="svc-stat-badge svc-stat-badge--tl" style={{ animationDelay: "0.2s" }}>
          4+ services
        </div>
        <div className="svc-stat-badge svc-stat-badge--br" style={{ animationDelay: "0.9s" }}>
          Built for growth
        </div>
      </div>
    </div>
  );
}

export default ServicesVisual;
