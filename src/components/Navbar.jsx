import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BrandLockup } from "./Logo";

const navItems = [
  { to: "/", label: "Home", end: true },
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

function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-nav backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex justify-between items-center h-20">

          <Link to="/" className="inline-flex items-center shrink-0">
            <BrandLockup logoClassName="h-11 w-auto object-contain" textClassName="text-xl md:text-2xl" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-fg"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>

        {open && (
          <div className="md:hidden flex flex-col gap-4 py-6">
            {navItems.map(({ to, label, end }) => (
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
