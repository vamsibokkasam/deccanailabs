import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Shield,
  UserCheck,
  X,
} from "lucide-react";
import { BrandLockup, BrandName } from "../components/Logo";

const SIDEBAR_COLLAPSED_KEY = "deccanailabs_admin_sidebar_collapsed";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: UserCheck, countKey: "applications" },
  { id: "contacts", label: "Contacts", icon: Mail, countKey: "contacts" },
  { id: "programs", label: "Programs", icon: BookOpen, countKey: "programs" },
];

const pageTitles = {
  dashboard: "Dashboard Overview",
  applications: "Internship Applications",
  contacts: "Contact Messages",
  programs: "Program Management",
};

function SidebarTooltip({ label, show, badge, children }) {
  if (!show) {
    return children;
  }

  return (
    <div className="relative group/tip w-full">
      {children}
      <div
        role="tooltip"
        className="pointer-events-none absolute left-[calc(100%+0.625rem)] top-1/2 -translate-y-1/2 z-[100] hidden lg:flex items-center opacity-0 translate-x-1 group-hover/tip:opacity-100 group-hover/tip:translate-x-0 transition-all duration-150"
      >
        <span className="px-2.5 py-1.5 rounded-lg bg-fg text-bg text-xs font-medium whitespace-nowrap shadow-xl border border-border/20">
          {label}
          {badge != null && badge > 0 ? ` (${badge})` : ""}
        </span>
      </div>
    </div>
  );
}

function NavButton({ item, isActive, count, collapsedDesktop, onClick }) {
  const Icon = item.icon;

  return (
    <SidebarTooltip
      label={item.label}
      badge={count}
      show={collapsedDesktop}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={item.label}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 lg:px-4 lg:py-3 ${
          collapsedDesktop ? "lg:justify-center lg:gap-0 lg:px-3 lg:py-3" : ""
        } ${
          isActive
            ? "bg-accent/15 text-accent border border-accent/25 shadow-lg shadow-accent/5"
            : "text-muted hover:text-fg hover:bg-surface/80 border border-transparent"
        }`}
      >
        <span className="relative shrink-0">
          <Icon size={18} className={isActive ? "text-accent" : "text-subtle"} />
          {collapsedDesktop && count != null && count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-[10px] font-bold text-white hidden lg:flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </span>
        <span className={`flex-1 text-left truncate ${collapsedDesktop ? "lg:hidden" : ""}`}>
          {item.label}
        </span>
        {count != null && count > 0 && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] text-center shrink-0 ${
              collapsedDesktop ? "lg:hidden" : ""
            } ${
              isActive
                ? "bg-accent/20 text-accent"
                : "bg-surface text-subtle border border-border"
            }`}
          >
            {count}
          </span>
        )}
      </button>
    </SidebarTooltip>
  );
}

function AdminShell({
  activeTab,
  onTabChange,
  onLogout,
  onRefresh,
  loading,
  counts,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
  );

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  const closeSidebar = () => setSidebarOpen(false);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <div className="min-h-screen bg-bg flex">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col bg-surface/95 backdrop-blur-xl border-r border-border/60 transition-all duration-300 ease-in-out w-72 ${
          collapsed ? "lg:w-[4.75rem] lg:overflow-visible" : "lg:w-72"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <button
          type="button"
          onClick={closeSidebar}
          className="absolute top-5 right-4 p-1.5 rounded-lg text-muted hover:text-fg lg:hidden"
        >
          <X size={20} />
        </button>

        <div
          className={`border-b border-border/60 shrink-0 ${
            collapsed ? "lg:p-4 lg:flex lg:justify-center p-6" : "p-6"
          }`}
        >
          {collapsed ? (
            <SidebarTooltip label="DECCAN AI labs Admin" show={collapsed}>
              <Link
                to="/"
                className="hidden lg:inline-flex items-center justify-center"
              >
                <BrandLockup
                  showText={false}
                  logoClassName="h-9 w-9 object-contain"
                />
              </Link>
            </SidebarTooltip>
          ) : null}

          <div className={collapsed ? "lg:hidden" : ""}>
            <Link to="/" className="inline-flex">
              <BrandLockup logoClassName="h-10 w-auto object-contain" textClassName="text-lg" />
            </Link>
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
                <Shield size={12} />
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        <nav
          className={`flex-1 space-y-1 ${
            collapsed
              ? "lg:p-2 lg:overflow-visible p-4 overflow-y-auto"
              : "p-4 overflow-y-auto overflow-x-hidden"
          }`}
        >
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              count={item.countKey ? counts[item.countKey] : null}
              collapsedDesktop={collapsed}
              onClick={() => {
                onTabChange(item.id);
                closeSidebar();
              }}
            />
          ))}
        </nav>

        <div
          className={`border-t border-border/60 shrink-0 space-y-1 ${
            collapsed
              ? "lg:p-2 lg:overflow-visible p-4"
              : "p-4"
          }`}
        >
          <SidebarTooltip label="View Website" show={collapsed}>
            <Link
              to="/"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-fg hover:bg-surface/80 transition ${
                collapsed ? "lg:justify-center lg:gap-0 lg:px-3" : ""
              }`}
            >
              <ExternalLink size={18} className="shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>View Website</span>
            </Link>
          </SidebarTooltip>

          <SidebarTooltip label="Sign Out" show={collapsed}>
            <button
              type="button"
              onClick={onLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition ${
                collapsed ? "lg:justify-center lg:gap-0 lg:px-3" : ""
              }`}
            >
              <LogOut size={18} className="shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>Sign Out</span>
            </button>
          </SidebarTooltip>

          <SidebarTooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} show={collapsed}>
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`hidden lg:flex w-full items-center rounded-xl text-sm font-medium text-muted hover:text-accent hover:bg-accent/10 border border-transparent hover:border-accent/20 transition ${
                collapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
              }`}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              {!collapsed && <span className="flex-1 text-left">Collapse</span>}
            </button>
          </SidebarTooltip>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-8 py-4 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-border text-muted hover:text-fg hover:bg-surface transition"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <BrandName className="text-sm hidden sm:block" />
              <h1 className="text-lg md:text-xl font-medium text-fg truncate mt-0.5">
                {pageTitles[activeTab]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-muted hover:text-accent hover:border-accent/30 transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="text-sm hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-muted hover:text-red-400 hover:border-red-500/30 transition"
            >
              <LogOut size={16} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export { navItems };
export default AdminShell;
