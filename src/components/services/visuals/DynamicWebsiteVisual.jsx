import { FileEdit, Eye } from "lucide-react";

function DynamicWebsiteVisual() {
  return (
    <div className="svc-visual svc-visual--dynamic">
      <div className="svc-visual-stage" aria-hidden="true">
        <div className="svc-visual-glow" />

        <div className="svc-cms-board">
          <div className="svc-cms-panel svc-float-soft" style={{ animationDelay: "0s" }}>
            <div className="svc-cms-panel-head">
              <FileEdit size={14} />
              <span>Content editor</span>
            </div>
            <div className="svc-cms-field">
              <span className="svc-cms-label">Page title</span>
              <span className="svc-cms-input">Home — grow online</span>
            </div>
            <div className="svc-cms-field">
              <span className="svc-cms-label">Hero text</span>
              <span className="svc-cms-input tall">Update anytime without a developer.</span>
            </div>
            <div className="svc-cms-actions">
              <span className="svc-cms-btn">Save draft</span>
              <span className="svc-cms-btn solid">Publish</span>
            </div>
          </div>

          <div className="svc-cms-preview" style={{ animationDelay: "0.45s" }}>
            <div className="svc-cms-panel-head">
              <Eye size={14} />
              <span>Live preview</span>
            </div>
            <div className="svc-visual-window-bar">
              <span /><span /><span />
            </div>
            <div className="svc-site-preview compact">
              <div className="svc-site-nav" />
              <div className="svc-visual-skeleton svc-visual-skeleton--title" />
              <div className="svc-visual-skeleton svc-visual-skeleton--line" />
              <div className="svc-site-cards">
                <span /><span />
              </div>
            </div>
          </div>
        </div>

        <div className="svc-stat-badge svc-stat-badge--tl" style={{ animationDelay: "0.2s" }}>
          Admin editable
        </div>
        <div className="svc-stat-badge svc-stat-badge--br" style={{ animationDelay: "1s" }}>
          SEO-ready
        </div>
      </div>
    </div>
  );
}

export default DynamicWebsiteVisual;
