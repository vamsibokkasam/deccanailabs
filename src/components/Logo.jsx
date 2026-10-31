import {
  BRAND_LEGAL_SUFFIX,
  BRAND_NAME,
  SITE_LOGO_PATH,
} from "../config/branding.js";

export const SITE_LOGO_SRC = SITE_LOGO_PATH;

export function BrandLogo({ className = "h-10 w-auto object-contain" }) {
  return (
    <img
      src={SITE_LOGO_SRC}
      alt={BRAND_NAME}
      className={`${className} mix-blend-lighten`}
      decoding="async"
    />
  );
}

export function BrandName({ className = "text-xl", showLegal = true }) {
  return (
    <span className={`brand-name leading-none ${className}`}>
      <span className="brand-word font-bold tracking-tight whitespace-nowrap">
        <span className="text-fg">DECCAN </span>
        <span className="bg-gradient-to-r from-accent to-accent-warm bg-clip-text text-transparent">
          AI{" "}
        </span>
        <span className="text-fg">LABS</span>
      </span>
      {showLegal ? (
        <span className="brand-legal">
          <span className="brand-legal-line" aria-hidden="true" />
          <span className="brand-legal-text">{BRAND_LEGAL_SUFFIX}</span>
          <span className="brand-legal-line" aria-hidden="true" />
        </span>
      ) : null}
    </span>
  );
}

export function BrandLockup({
  className = "inline-flex items-center gap-2.5",
  logoClassName = "h-10 w-auto object-contain",
  textClassName = "text-xl",
  showText = true,
  showLegal = true,
}) {
  return (
    <span className={className}>
      <BrandLogo className={logoClassName} />
      {showText && <BrandName className={textClassName} showLegal={showLegal} />}
    </span>
  );
}

export function BrandText({ className = "text-2xl", showLegal = true }) {
  return <BrandName className={className} showLegal={showLegal} />;
}
