import { SITE_LOGO_PATH } from "../config/branding.js";

export const SITE_LOGO_SRC = SITE_LOGO_PATH;

export function BrandLogo({ className = "h-10 w-auto object-contain" }) {
  return (
    <img
      src={SITE_LOGO_SRC}
      alt="DECCAN AI labs"
      className={className}
      decoding="async"
    />
  );
}

export function BrandName({ className = "text-xl" }) {
  return (
    <span className={`font-bold tracking-tight whitespace-nowrap ${className}`}>
      <span className="text-fg">DECCAN </span>
      <span className="bg-gradient-to-r from-accent to-accent-warm bg-clip-text text-transparent">
        AI{" "}
      </span>
      <span className="text-fg">labs</span>
    </span>
  );
}

export function BrandLockup({
  className = "inline-flex items-center gap-2.5",
  logoClassName = "h-10 w-auto object-contain",
  textClassName = "text-xl",
  showText = true,
}) {
  return (
    <span className={className}>
      <BrandLogo className={logoClassName} />
      {showText && <BrandName className={textClassName} />}
    </span>
  );
}

export function BrandText({ className = "text-2xl" }) {
  return <BrandName className={className} />;
}
