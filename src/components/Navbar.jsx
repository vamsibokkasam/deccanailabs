import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  LayoutTemplate,
  Menu,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { BrandLockup } from "./Logo";
import { services } from "../data/services";

const primaryNavItems = [{ to: "/", label: "Home", end: true }];

const secondaryNavItems = [
  { to: "/about", label: "About" },
  { to: "/programs", label: "Strategy" },
  { to: "/internships", label: "Internships" },
  { to: "/contact", label: "Contact" },
];

function navLinkClass({ isActive }) {
  return [
    "transition",
    isActive ? "text-accent font-medium" : "text-muted hover:text-accent",
  ].join(" ");
}

function servicesTriggerClass(isActive) {
  return [
    "nav-services-trigger transition",
    isActive ? "text-accent font-medium" : "text-muted hover:text-accent",
  ].join(" ");
}

function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesRef = useRef(null);

  const servicesActive = pathname.startsWith("/services");
  const closeMenu = () => {
    setOpen(false);
    setMobileServicesOpen(false);
  };

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!servicesOpen) return undefined;

    const onPointerDown = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setServicesOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setServicesOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [servicesOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-nav border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="inline-flex items-center shrink-0">
            <BrandLockup
              logoClassName="h-11 w-auto object-contain"
              textClassName="text-xl md:text-2xl"
              showLegal={false}
            />
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {primaryNavItems.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                {label}
              </NavLink>
            ))}

            <div
              ref={servicesRef}
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <NavLink
                to="/services"
                className={() => servicesTriggerClass(servicesActive)}
                aria-expanded={servicesOpen}
                aria-haspopup="menu"
                onClick={() => setServicesOpen(false)}
              >
                Our Services
                <ChevronDown
                  size={15}
                  strokeWidth={2.25}
                  className="nav-services-chevron"
                  aria-hidden="true"
                />
              </NavLink>

              {servicesOpen ? (
                <div role="menu" className="nav-services-menu">
                  <div className="nav-services-panel">
                    {services.map((service) => (
                      <NavLink
                        key={service.link}
                        to={service.link}
                        role="menuitem"
                        className={({ isActive }) =>
                          [
                            "nav-services-item",
                            isActive ? "is-active" : "",
                          ].join(" ")
                        }
                        onClick={() => setServicesOpen(false)}
                      >
                        <span className="nav-services-item-icon" aria-hidden="true">
                          <LayoutTemplate size={18} strokeWidth={1.8} />
                        </span>
                        <span className="nav-services-item-copy">
                          <span className="nav-services-item-title">
                            {service.title}
                            <ArrowUpRight
                              size={15}
                              className="nav-services-item-arrow"
                              aria-hidden="true"
                            />
                          </span>
                          <span className="nav-services-item-desc">
                            {service.description}
                          </span>
                        </span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {secondaryNavItems.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-fg"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden flex flex-col gap-4 py-6">
            {primaryNavItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={navLinkClass}
                onClick={closeMenu}
              >
                {label}
              </NavLink>
            ))}

            <div>
              <div className="flex items-center justify-between gap-3">
                <NavLink
                  to="/services"
                  className={() => servicesTriggerClass(servicesActive)}
                  onClick={closeMenu}
                >
                  Our Services
                </NavLink>
                <button
                  type="button"
                  className="text-muted hover:text-accent transition p-1"
                  aria-expanded={mobileServicesOpen}
                  aria-label={
                    mobileServicesOpen
                      ? "Hide Our Services submenu"
                      : "Show Our Services submenu"
                  }
                  onClick={() => setMobileServicesOpen((prev) => !prev)}
                >
                  {mobileServicesOpen ? <Minus size={18} /> : <Plus size={18} />}
                </button>
              </div>

              {mobileServicesOpen ? (
                <div className="nav-services-mobile">
                  {services.map((service) => (
                    <NavLink
                      key={service.link}
                      to={service.link}
                      className={({ isActive }) =>
                        [
                          "nav-services-item",
                          isActive ? "is-active" : "",
                        ].join(" ")
                      }
                      onClick={closeMenu}
                    >
                      <span className="nav-services-item-icon" aria-hidden="true">
                        <LayoutTemplate size={18} strokeWidth={1.8} />
                      </span>
                      <span className="nav-services-item-copy">
                        <span className="nav-services-item-title">
                          {service.title}
                          <ArrowUpRight
                            size={15}
                            className="nav-services-item-arrow"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="nav-services-item-desc">
                          {service.description}
                        </span>
                      </span>
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>

            {secondaryNavItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={navLinkClass}
                onClick={closeMenu}
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
