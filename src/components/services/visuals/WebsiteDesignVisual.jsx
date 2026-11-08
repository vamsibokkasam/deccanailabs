function WebsiteDesignVisual() {
  return (
    <div className="svc-visual svc-visual--website svc-visual--photo">
      <div className="svc-hero-photo">
        <img
          src="/Website_hero-preview.png"
          alt="Website design preview with laptop and phone mockups, PageSpeed 98, and conversion metrics"
          width={1200}
          height={900}
          loading="eager"
          decoding="async"
        />
        <div className="svc-hero-photo-glow" aria-hidden="true" />
      </div>
    </div>
  );
}

export default WebsiteDesignVisual;
