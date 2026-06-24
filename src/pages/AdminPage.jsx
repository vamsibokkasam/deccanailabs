import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Image,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import FormField from "../components/FormField";
import AdminShell from "../layouts/AdminShell";
import { BrandLockup } from "../components/Logo";
import { inputClass } from "../utils/themeClasses";
import {
  createProgram,
  deleteApplication,
  deleteProgram,
  getAdminPrograms,
  getAdminStats,
  getApplications,
  getContacts,
  updateApplicationStatus,
  updatePaymentStatus,
  updateProgram,
  verifyAdmin,
} from "../services/api";
import { validateProgramForm } from "../utils/validation";

const ADMIN_KEY_STORAGE = "deccanailabs_admin_key";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  reviewed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  accepted: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const paymentStatusColors = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  verified: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const applicationStatusOptions = ["pending", "reviewed", "accepted", "rejected"];

const APPLICATIONS_PAGE_SIZE = 10;

const emptyApplicationFilters = {
  search: "",
  program: "",
  status: "",
};

const emptyContactFilters = {
  search: "",
  internship: "",
};

function matchesApplicationSearch(app, query) {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const normalizedQuery = trimmed.toLowerCase();
  const nameMatch = app.fullName?.toLowerCase().includes(normalizedQuery);

  const phoneDigits = (app.phone || "").replace(/\D/g, "");
  const digitQuery = trimmed.replace(/\D/g, "");

  let phoneMatch = false;
  if (digitQuery) {
    if (digitQuery.length === 4) {
      phoneMatch = phoneDigits.slice(-4) === digitQuery;
    } else {
      phoneMatch = phoneDigits.endsWith(digitQuery);
    }
  }

  const applicationIdMatch = app.applicationId?.toLowerCase().includes(normalizedQuery);

  return nameMatch || phoneMatch || applicationIdMatch;
}

function filterApplications(applications, filters) {
  return applications.filter((app) => {
    if (filters.program && app.program !== filters.program) return false;
    if (filters.status && app.status !== filters.status) return false;
    if (!matchesApplicationSearch(app, filters.search)) return false;
    return true;
  });
}

function getContactDisplayName(contact) {
  if (contact.firstName && contact.lastName) {
    return `${contact.firstName} ${contact.lastName}`;
  }

  return contact.fullName || "Unknown";
}

function getContactInternship(contact) {
  return contact.internship || contact.subject || "—";
}

function matchesContactSearch(contact, query) {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const normalizedQuery = trimmed.toLowerCase();
  const nameMatch = getContactDisplayName(contact).toLowerCase().includes(normalizedQuery);
  const emailMatch = contact.email?.toLowerCase().includes(normalizedQuery);
  const internshipMatch = getContactInternship(contact).toLowerCase().includes(normalizedQuery);
  const messageMatch = contact.message?.toLowerCase().includes(normalizedQuery);

  const phoneDigits = (contact.whatsapp || "").replace(/\D/g, "");
  const digitQuery = trimmed.replace(/\D/g, "");

  let phoneMatch = false;
  if (digitQuery) {
    if (digitQuery.length === 4) {
      phoneMatch = phoneDigits.slice(-4) === digitQuery;
    } else {
      phoneMatch = phoneDigits.endsWith(digitQuery);
    }
  }

  return nameMatch || emailMatch || internshipMatch || messageMatch || phoneMatch;
}

function filterContacts(contacts, filters) {
  return contacts.filter((contact) => {
    const internship = getContactInternship(contact);
    if (filters.internship && internship !== filters.internship) return false;
    if (!matchesContactSearch(contact, filters.search)) return false;
    return true;
  });
}

function FilterSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  isOpen,
  onOpenChange,
}) {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });

  const updateMenuPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight =
      menuRef.current?.offsetHeight ||
      Math.min(options.length * 42 + 8, 240);
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const openUpward = spaceBelow < menuHeight && rect.top > menuHeight + 12;

    setMenuStyle({
      top: openUpward ? rect.top - menuHeight - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (isOpen) updateMenuPosition();
  }, [isOpen, options.length]);

  useEffect(() => {
    if (!isOpen) return undefined;

    updateMenuPosition();

    const handleScrollOrResize = () => updateMenuPosition();
    const handleClickOutside = (event) => {
      const target = event.target;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      onOpenChange(false);
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onOpenChange, options.length]);

  const selectedLabel =
    options.find((option) => option.value === value)?.label || placeholder;

  const menu = isOpen
    ? createPortal(
        <ul
          ref={menuRef}
          role="listbox"
          aria-labelledby={id}
          style={{
            position: "fixed",
            top: menuStyle.top,
            left: menuStyle.left,
            width: menuStyle.width,
            zIndex: 9999,
          }}
          className="max-h-60 overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl py-1 ring-1 ring-white/10 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.5)_transparent]"
        >
          {options.map((option) => (
            <li key={option.value || "__all__"} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  onOpenChange(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition ${
                  value === option.value
                    ? "bg-accent/20 text-accent font-medium"
                    : "text-fg hover:bg-white/5"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={() => onOpenChange(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm focus:outline-none transition text-left ${
          isOpen
            ? "bg-surface border border-accent/40 ring-1 ring-accent/20"
            : "bg-input border border-border hover:border-accent/30 focus:border-accent/50"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate ${value ? "text-fg" : "text-subtle"}`}>{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`text-muted shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {menu}
    </>
  );
}

function ApplicationFilters({ filters, onChange, programOptions, resultCount, totalCount }) {
  const [openFilterId, setOpenFilterId] = useState(null);
  const hasActiveFilters =
    filters.search || filters.program || filters.status;

  const handleChange = (field) => (event) => {
    onChange({ ...filters, [field]: event.target.value });
  };

  const clearFilters = () => {
    onChange(emptyApplicationFilters);
  };

  const programSelectOptions = [
    { value: "", label: "All programs" },
    ...programOptions.map((program) => ({ value: program, label: program })),
  ];

  const statusSelectOptions = [
    { value: "", label: "All statuses" },
    ...applicationStatusOptions.map((status) => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
    })),
  ];

  return (
    <div className="theme-card px-3 py-2.5 relative z-10">
      <div className="flex flex-col xl:flex-row xl:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <label htmlFor="application-search" className="sr-only">
            Search applications
          </label>
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            id="application-search"
            type="search"
            value={filters.search}
            onChange={handleChange("search")}
            placeholder="Name or phone last 4 digits..."
            className="w-full bg-input border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-fg placeholder-subtle focus:outline-none focus:border-accent/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="w-full sm:w-40 min-w-0">
            <label htmlFor="application-program-filter" className="sr-only">
              Filter by program
            </label>
            <FilterSelect
              id="application-program-filter"
              value={filters.program}
              onChange={(value) => onChange({ ...filters, program: value })}
              options={programSelectOptions}
              placeholder="All programs"
              isOpen={openFilterId === "program"}
              onOpenChange={(nextOpen) => setOpenFilterId(nextOpen ? "program" : null)}
            />
          </div>

          <div className="w-full sm:w-36 min-w-0">
            <label htmlFor="application-status-filter" className="sr-only">
              Filter by status
            </label>
            <FilterSelect
              id="application-status-filter"
              value={filters.status}
              onChange={(value) => onChange({ ...filters, status: value })}
              options={statusSelectOptions}
              placeholder="All statuses"
              isOpen={openFilterId === "status"}
              onOpenChange={(nextOpen) => setOpenFilterId(nextOpen ? "status" : null)}
            />
          </div>

          <span className="text-xs text-muted whitespace-nowrap px-1">
            <span className="text-fg font-medium">{resultCount}</span>/{totalCount}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-muted hover:text-accent transition whitespace-nowrap px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactFilters({ filters, onChange, internshipOptions, resultCount, totalCount }) {
  const [openFilterId, setOpenFilterId] = useState(null);
  const hasActiveFilters = filters.search || filters.internship;

  const handleChange = (field) => (event) => {
    onChange({ ...filters, [field]: event.target.value });
  };

  const clearFilters = () => {
    onChange(emptyContactFilters);
  };

  const internshipSelectOptions = [
    { value: "", label: "All internships" },
    ...internshipOptions.map((internship) => ({ value: internship, label: internship })),
  ];

  return (
    <div className="theme-card px-3 py-2.5 relative z-10">
      <div className="flex flex-col xl:flex-row xl:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <label htmlFor="contact-search" className="sr-only">
            Search contacts
          </label>
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            id="contact-search"
            type="search"
            value={filters.search}
            onChange={handleChange("search")}
            placeholder="Name, email, WhatsApp, or message..."
            className="w-full bg-input border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-fg placeholder-subtle focus:outline-none focus:border-accent/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="w-full sm:w-44 min-w-0">
            <label htmlFor="contact-internship-filter" className="sr-only">
              Filter by internship
            </label>
            <FilterSelect
              id="contact-internship-filter"
              value={filters.internship}
              onChange={(value) => onChange({ ...filters, internship: value })}
              options={internshipSelectOptions}
              placeholder="All internships"
              isOpen={openFilterId === "internship"}
              onOpenChange={(nextOpen) => setOpenFilterId(nextOpen ? "internship" : null)}
            />
          </div>

          <span className="text-xs text-muted whitespace-nowrap px-1">
            <span className="text-fg font-medium">{resultCount}</span>/{totalCount}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-muted hover:text-accent transition whitespace-nowrap px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const emptyProgramForm = {
  title: "",
  description: "",
  duration: "8-12 weeks",
  isActive: true,
};

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StatusBadge({ label, className }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium capitalize ${className}`}>
      {label}
    </span>
  );
}

function ScreenshotModal({ preview, onClose }) {
  useEffect(() => {
    if (!preview) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [preview, onClose]);

  if (!preview) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay px-4 py-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Payment screenshot preview"
    >
      <div
        className="w-full max-w-4xl bg-surface border border-border rounded-2xl relative max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-border shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg font-medium text-fg truncate">{preview.fullName}</h3>
            <p className="text-accent text-xs font-mono mt-1">
              {preview.applicationId || "Payment screenshot"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={preview.src}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-accent border border-border hover:border-accent/30 transition"
            >
              Open full
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted hover:text-fg hover:bg-card transition"
              aria-label="Close screenshot preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-auto flex-1 flex items-center justify-center bg-bg/50">
          <img
            src={preview.src}
            alt={`Payment screenshot for ${preview.fullName}`}
            className="max-w-full max-h-[70vh] object-contain rounded-xl border border-border"
          />
        </div>
      </div>
    </div>
  );
}

function ApplicationsTable({
  applications,
  onStatusChange,
  onPaymentStatusChange,
  onDelete,
  paymentActionId,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(applications.length / APPLICATIONS_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * APPLICATIONS_PAGE_SIZE;
  const paginatedApplications = applications.slice(
    startIndex,
    startIndex + APPLICATIONS_PAGE_SIZE
  );
  const rangeStart = applications.length === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(safePage * APPLICATIONS_PAGE_SIZE, applications.length);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedId(null);
  }, [applications.length, applications.map((app) => app._id).join(",")]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const copyTransactionId = async (transactionId) => {
    if (!transactionId) return;
    try {
      await navigator.clipboard.writeText(transactionId);
    } catch {
      /* clipboard unavailable */
    }
  };

  const toggleRow = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const openScreenshot = (app) => {
    if (!app.payment?.screenshotData) return;
    setScreenshotPreview({
      src: app.payment.screenshotData,
      fullName: app.fullName,
      applicationId: app.applicationId,
    });
  };

  return (
    <>
    <div className="theme-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="w-10 px-3 py-3" aria-label="Expand row" />
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Applicant
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Application ID
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Contact
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                College
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Program
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Fee
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Payment
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedApplications.map((app) => {
              const isExpanded = expandedId === app._id;
              const hasPendingPayment =
                app.payment?.transactionId && app.payment?.status === "pending";

              return (
                <Fragment key={app._id}>
                  <tr
                    className={`border-b border-border transition-colors hover:bg-surface/40 ${
                      hasPendingPayment ? "bg-yellow-500/[0.03]" : ""
                    } ${isExpanded ? "bg-surface/30" : ""}`}
                  >
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => toggleRow(app._id)}
                        className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-surface border border-transparent hover:border-border transition"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Collapse row" : "Expand row"}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accent-warm/10 border border-accent/25 flex items-center justify-center text-accent text-xs font-semibold shrink-0">
                          {getInitials(app.fullName)}
                        </div>
                        <span className="font-medium text-fg truncate max-w-[140px]">
                          {app.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-accent font-mono text-xs whitespace-nowrap">
                        {app.applicationId || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <p className="text-accent truncate">{app.email}</p>
                      <p className="text-muted text-xs mt-0.5">{app.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-muted max-w-[140px]">
                      <span className="line-clamp-2">{app.college || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-fg max-w-[120px]">
                      <span className="line-clamp-2">{app.program}</span>
                    </td>
                    <td className="px-4 py-3 text-fg whitespace-nowrap">
                      {app.feeAmount ? `₹${app.feeAmount}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {app.payment?.status ? (
                        <StatusBadge
                          label={app.payment.status}
                          className={paymentStatusColors[app.payment.status]}
                        />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={app.status} className={statusColors[app.status]} />
                    </td>
                    <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {app.payment?.screenshotData && (
                          <button
                            type="button"
                            onClick={() => openScreenshot(app)}
                            className="p-1.5 rounded-lg text-accent hover:bg-accent/10 transition"
                            title="View screenshot"
                          >
                            <Image size={16} />
                          </button>
                        )}
                        {app.payment?.transactionId && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPaymentStatusChange(app._id, "verified");
                              }}
                              disabled={
                                paymentActionId === app._id || app.payment?.status === "verified"
                              }
                              className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/15 disabled:opacity-40 transition"
                              title="Verify payment"
                            >
                              {paymentActionId === app._id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPaymentStatusChange(app._id, "rejected");
                              }}
                              disabled={
                                paymentActionId === app._id || app.payment?.status === "rejected"
                              }
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 disabled:opacity-40 transition"
                              title="Reject payment"
                            >
                              {paymentActionId === app._id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <XCircle size={16} />
                              )}
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleRow(app._id)}
                          className="px-2 py-1 rounded-lg text-xs text-muted hover:text-accent hover:bg-surface border border-border transition"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(app._id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition"
                          title="Delete application"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-border bg-surface/20">
                      <td colSpan={11} className="px-4 py-5">
                        <div className="grid lg:grid-cols-[1fr_auto] gap-6">
                          <div className="space-y-5">
                            {app.payment?.transactionId && (
                              <div>
                                <p className="text-subtle text-xs uppercase tracking-wider mb-2">
                                  Transaction ID
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <code className="text-sm text-fg bg-input border border-border rounded-xl px-4 py-2 font-mono">
                                    {app.payment.transactionId}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => copyTransactionId(app.payment.transactionId)}
                                    className="p-2 rounded-lg border border-border text-muted hover:text-accent hover:border-accent/30 transition"
                                    title="Copy transaction ID"
                                  >
                                    <Copy size={15} />
                                  </button>
                                </div>
                              </div>
                            )}

                            <div>
                              <p className="text-subtle text-xs uppercase tracking-wider mb-2">
                                Application Status
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {["pending", "reviewed", "accepted", "rejected"].map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => onStatusChange(app._id, status)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition ${
                                      app.status === status
                                        ? statusColors[status]
                                        : "bg-surface border-border text-muted hover:bg-card hover:text-fg"
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {app.message && (
                              <div>
                                <p className="text-subtle text-xs uppercase tracking-wider mb-2">
                                  Message
                                </p>
                                <p className="text-muted text-sm leading-relaxed">{app.message}</p>
                              </div>
                            )}
                          </div>

                          {app.payment?.screenshotData && (
                            <div className="lg:w-72 shrink-0">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-subtle text-xs uppercase tracking-wider">
                                  Payment Proof
                                </p>
                                <button
                                  type="button"
                                  onClick={() => openScreenshot(app)}
                                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                                >
                                  View in modal
                                  <Image size={12} />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => openScreenshot(app)}
                                className="block w-full rounded-xl border border-border bg-bg overflow-hidden hover:border-accent/30 transition"
                              >
                                <img
                                  src={app.payment.screenshotData}
                                  alt="Payment screenshot"
                                  className="max-h-56 w-full object-contain p-2"
                                />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {applications.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border bg-surface/40">
          <p className="text-xs text-muted">
            Showing{" "}
            <span className="text-fg font-medium">
              {rangeStart}-{rangeEnd}
            </span>{" "}
            of <span className="text-fg font-medium">{applications.length}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage <= 1}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-border text-muted hover:text-accent hover:border-accent/30 disabled:opacity-40 disabled:pointer-events-none transition"
            >
              <ChevronLeft size={14} />
              Prev
            </button>

            <span className="text-xs text-muted min-w-[5.5rem] text-center">
              Page <span className="text-fg font-medium">{safePage}</span> of{" "}
              <span className="text-fg font-medium">{totalPages}</span>
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safePage >= totalPages}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-border text-muted hover:text-accent hover:border-accent/30 disabled:opacity-40 disabled:pointer-events-none transition"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>

    <ScreenshotModal
      preview={screenshotPreview}
      onClose={() => setScreenshotPreview(null)}
    />
    </>
  );
}

function ContactsTable({ contacts }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleRow = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const copyText = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="theme-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="w-10 px-3 py-3" aria-label="Expand row" />
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                WhatsApp
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Internship
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Message
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 text-subtle text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => {
              const displayName = getContactDisplayName(contact);
              const internship = getContactInternship(contact);
              const isExpanded = expandedId === contact._id;

              return (
                <Fragment key={contact._id}>
                  <tr
                    className={`border-b border-border transition-colors hover:bg-surface/40 ${
                      isExpanded ? "bg-surface/30" : ""
                    }`}
                  >
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => toggleRow(contact._id)}
                        className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-surface border border-transparent hover:border-border transition"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Collapse row" : "Expand row"}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accent-warm/10 border border-accent/25 flex items-center justify-center text-accent text-xs font-semibold shrink-0">
                          {getInitials(displayName)}
                        </div>
                        <span className="font-medium text-fg truncate max-w-[140px]">
                          {displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <p className="text-accent truncate">{contact.email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-fg">{contact.whatsapp || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-fg max-w-[160px]">
                      <span className="line-clamp-2">{internship}</span>
                    </td>
                    <td className="px-4 py-3 text-muted max-w-[220px]">
                      <span className="line-clamp-2">{contact.message}</span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleRow(contact._id)}
                        className="px-2 py-1 rounded-lg text-xs text-muted hover:text-accent hover:bg-surface border border-border transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-border bg-surface/20">
                      <td colSpan={8} className="px-4 py-5">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-subtle text-xs uppercase tracking-wider mb-2">
                                Contact Details
                              </p>
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <code className="text-sm text-accent bg-input border border-border rounded-xl px-4 py-2">
                                    {contact.email}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => copyText(contact.email)}
                                    className="p-2 rounded-lg border border-border text-muted hover:text-accent hover:border-accent/30 transition"
                                    title="Copy email"
                                  >
                                    <Copy size={15} />
                                  </button>
                                </div>
                                {contact.whatsapp && (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <code className="text-sm text-fg bg-input border border-border rounded-xl px-4 py-2">
                                      {contact.whatsapp}
                                    </code>
                                    <button
                                      type="button"
                                      onClick={() => copyText(contact.whatsapp)}
                                      className="p-2 rounded-lg border border-border text-muted hover:text-accent hover:border-accent/30 transition"
                                      title="Copy WhatsApp number"
                                    >
                                      <Copy size={15} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-subtle text-xs uppercase tracking-wider mb-2">
                                Internship Interest
                              </p>
                              <p className="text-fg text-sm">{internship}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-subtle text-xs uppercase tracking-wider mb-2">
                              Full Message
                            </p>
                            <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap rounded-xl border border-border bg-bg/50 p-4">
                              {contact.message}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent = "text-accent", trend, hint }) {
  return (
    <div className="theme-card p-6 relative overflow-hidden group hover:border-accent/30 transition-all duration-300">
      <div className="absolute top-0 right-0 w-28 h-28 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl bg-surface border border-border flex items-center justify-center ${accent} group-hover:scale-105 transition-transform`}>
            <Icon size={20} />
          </div>
          {trend != null && (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
              <TrendingUp size={12} />
              {trend}
            </span>
          )}
        </div>
        <p className="text-3xl font-semibold text-fg mb-1 tracking-tight">{value}</p>
        <p className="text-subtle text-sm">{label}</p>
        {hint && <p className="text-muted text-xs mt-2">{hint}</p>}
      </div>
    </div>
  );
}

const statusMeta = {
  pending: { label: "Pending", icon: Clock, bar: "bg-yellow-400", ring: "ring-yellow-500/20" },
  reviewed: { label: "Reviewed", icon: Eye, bar: "bg-blue-400", ring: "ring-blue-500/20" },
  accepted: { label: "Accepted", icon: CheckCircle2, bar: "bg-green-400", ring: "ring-green-500/20" },
  rejected: { label: "Rejected", icon: XCircle, bar: "bg-red-400", ring: "ring-red-500/20" },
};

function DashboardPanel({ title, subtitle, icon: Icon, children, action }) {
  return (
    <div className="theme-card p-6 flex flex-col h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-warm/5 pointer-events-none" />
      <div className="relative flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-surface/80 border border-border flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
            <Icon size={20} className="text-accent" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-medium text-fg">{title}</h2>
            {subtitle && <p className="text-subtle text-xs mt-1">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="relative flex-1 flex flex-col">{children}</div>
    </div>
  );
}

function ProgramBreakdownChart({ items, totalApplications, maxCount }) {
  if (!items?.length) {
    return (
      <div className="flex-1 flex items-center justify-center py-10">
        <p className="text-muted text-sm">No applications yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.4)_transparent]">
        {items.map((item, index) => {
          const percentage = totalApplications
            ? Math.round((item.count / totalApplications) * 100)
            : 0;
          const barWidth = maxCount ? (item.count / maxCount) * 100 : 0;

          return (
            <div
              key={item.program}
              className="group rounded-2xl border border-border/60 bg-surface/40 p-4 hover:border-accent/25 hover:bg-surface/70 transition-all duration-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-semibold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-fg leading-snug">{item.program}</p>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-semibold text-accent leading-none">{item.count}</p>
                      <p className="text-[11px] text-subtle mt-1">{percentage}%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-2.5 bg-bg/80 rounded-full overflow-hidden border border-border/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent via-cyan-400 to-accent-warm transition-all duration-700 ease-out relative"
                  style={{ width: `${barWidth}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 mt-auto border-t border-border/60 flex items-center justify-between text-xs">
        <span className="text-subtle">{items.length} program{items.length !== 1 ? "s" : ""} tracked</span>
        <span className="text-muted">
          Top program: <span className="text-fg font-medium">{items[0]?.program}</span>
        </span>
      </div>
    </div>
  );
}

function StatusBreakdownChart({ statusCounts, totalApplications, onStatusClick }) {
  const statuses = applicationStatusOptions.map((status) => ({
    key: status,
    count: statusCounts?.[status] ?? 0,
    ...statusMeta[status],
  }));

  return (
    <div className="flex-1 flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 flex-1">
        {statuses.map(({ key, label, icon: Icon, count }) => {
          const percentage = totalApplications
            ? Math.round((count / totalApplications) * 100)
            : 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onStatusClick?.(key)}
              className="group text-left p-4 rounded-2xl bg-surface/50 border border-border hover:border-accent/30 hover:bg-surface/80 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-1.5 capitalize px-2.5 py-1 rounded-full border text-[11px] font-medium ${statusColors[key]}`}>
                  <Icon size={12} />
                  {label}
                </span>
                <span className="text-[11px] text-subtle group-hover:text-muted transition">{percentage}%</span>
              </div>
              <p className="text-3xl font-semibold text-fg tracking-tight">{count}</p>
              <p className="text-xs text-subtle mt-2 group-hover:text-accent transition">View applications</p>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border/60 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-subtle uppercase tracking-wider">Distribution</span>
          <span className="text-muted">{totalApplications} total</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden flex bg-bg/80 border border-border/40">
          {statuses.map(({ key, count, bar }) =>
            count > 0 ? (
              <div
                key={key}
                className={`${bar} transition-all duration-700`}
                style={{ width: `${totalApplications ? (count / totalApplications) * 100 : 0}%` }}
                title={`${statusMeta[key].label}: ${count}`}
              />
            ) : null
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {statuses.map(({ key, label, bar, count }) => (
            <div key={key} className="flex items-center gap-2 text-xs text-muted">
              <span className={`w-2.5 h-2.5 rounded-full ${bar}`} />
              <span>{label}</span>
              <span className="text-fg font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminPage() {
  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem(ADMIN_KEY_STORAGE) || ""
  );
  const [inputKey, setInputKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [contacts, setContacts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [programForm, setProgramForm] = useState(emptyProgramForm);
  const [editingProgram, setEditingProgram] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [programStatus, setProgramStatus] = useState({ type: "", message: "" });
  const [savingProgram, setSavingProgram] = useState(false);
  const [applicationFilters, setApplicationFilters] = useState(emptyApplicationFilters);
  const [contactFilters, setContactFilters] = useState(emptyContactFilters);
  const [paymentActionId, setPaymentActionId] = useState(null);

  const loadData = async (key) => {
    setLoading(true);
    setError("");

    try {
      const [contactsRes, applicationsRes, programsRes, statsRes] =
        await Promise.all([
          getContacts(key),
          getApplications(key),
          getAdminPrograms(key),
          getAdminStats(key),
        ]);
      setContacts(contactsRes.data);
      setApplications(applicationsRes.data);
      setPrograms(programsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("Unauthorized")) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminKey) return;

    verifyAdmin(adminKey)
      .then(() => {
        setAuthenticated(true);
        loadData(adminKey);
      })
      .catch(() => {
        sessionStorage.removeItem(ADMIN_KEY_STORAGE);
        setAdminKey("");
      });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      await verifyAdmin(inputKey);
      sessionStorage.setItem(ADMIN_KEY_STORAGE, inputKey);
      setAdminKey(inputKey);
      setAuthenticated(true);
      loadData(inputKey);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    setAdminKey("");
    setInputKey("");
    setAuthenticated(false);
    setContacts([]);
    setApplications([]);
    setPrograms([]);
    setStats(null);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateApplicationStatus(id, status, adminKey);
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status } : app))
      );
      const statsRes = await getAdminStats(adminKey);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePaymentStatusChange = async (id, paymentStatus) => {
    setError("");
    setPaymentActionId(id);

    try {
      const result = await updatePaymentStatus(id, paymentStatus, adminKey);
      const updated = result.data;

      setApplications((prev) =>
        prev.map((app) =>
          app._id === id
            ? {
                ...app,
                status: updated.status,
                payment: {
                  ...app.payment,
                  status: updated.payment?.status ?? paymentStatus,
                  verifiedAt: updated.payment?.verifiedAt,
                },
              }
            : app
        )
      );
      const statsRes = await getAdminStats(adminKey);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message || "Failed to update payment status");
    } finally {
      setPaymentActionId(null);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Delete this application? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteApplication(id, adminKey);
      setApplications((prev) => prev.filter((app) => app._id !== id));
      const statsRes = await getAdminStats(adminKey);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditProgram = (program) => {
    setEditingProgram(program);
    setProgramForm({
      title: program.title,
      description: program.description,
      duration: program.duration || "8-12 weeks",
      isActive: program.isActive,
    });
    setFieldErrors({});
    setProgramStatus({ type: "", message: "" });
  };

  const closeProgramModal = () => {
    setEditingProgram(null);
    setProgramForm(emptyProgramForm);
    setFieldErrors({});
    setProgramStatus({ type: "", message: "" });
  };

  const handleProgramChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProgramForm({
      ...programForm,
      [name]: type === "checkbox" ? checked : value,
    });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();

    const errors = validateProgramForm(programForm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setProgramStatus({ type: "error", message: "Please fix the errors below" });
      return;
    }

    setSavingProgram(true);
    setProgramStatus({ type: "", message: "" });
    setFieldErrors({});

    try {
      if (editingProgram) {
        const result = await updateProgram(editingProgram._id, programForm, adminKey);
        setPrograms((prev) =>
          prev.map((p) => (p._id === editingProgram._id ? result.data : p))
        );
        setProgramStatus({ type: "success", message: result.message });
        closeProgramModal();
      } else {
        const result = await createProgram(programForm, adminKey);
        setPrograms((prev) => [...prev, result.data]);
        setProgramForm(emptyProgramForm);
        setProgramStatus({ type: "success", message: result.message });
      }

      const statsRes = await getAdminStats(adminKey);
      setStats(statsRes.data);
    } catch (err) {
      setFieldErrors(err.errors || {});
      setProgramStatus({ type: "error", message: err.message });
    } finally {
      setSavingProgram(false);
    }
  };

  const handleDeleteProgram = async (id) => {
    if (!window.confirm("Delete this program? It will be hidden from the public site.")) {
      return;
    }

    try {
      await deleteProgram(id, adminKey);
      setPrograms((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isActive: false } : p))
      );
      const statsRes = await getAdminStats(adminKey);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestoreProgram = async (program) => {
    try {
      const result = await updateProgram(
        program._id,
        { ...program, isActive: true },
        adminKey
      );
      setPrograms((prev) =>
        prev.map((p) => (p._id === program._id ? result.data : p))
      );
      const statsRes = await getAdminStats(adminKey);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const maxProgramCount = stats?.applicationsPerProgram?.length
    ? Math.max(...stats.applicationsPerProgram.map((p) => p.count), 1)
    : 1;

  const pendingPayments = applications.filter(
    (app) => app.payment?.transactionId && app.payment?.status === "pending"
  ).length;

  if (!authenticated) {
    return (
      <section className="min-h-screen bg-bg flex items-center justify-center px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-accent-warm/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative">
          <div className="text-center mb-8">
            <BrandLockup
              className="inline-flex items-center gap-3 justify-center"
              logoClassName="h-14 w-auto object-contain"
              textClassName="text-2xl"
            />
            <p className="text-subtle text-sm mt-3">Secure admin access</p>
          </div>

          <div className="theme-card p-8 rounded-3xl border border-border/80">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Lock className="text-accent" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-medium text-fg">Admin Login</h1>
                <p className="text-subtle text-sm">Enter your admin key</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 mt-6">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Admin Key"
                required
                className="w-full bg-input border border-border rounded-xl p-4 text-fg placeholder-subtle focus:border-accent/50 focus:outline-none transition"
              />

              {loginError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-3">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full theme-btn-primary py-4 font-medium flex items-center justify-center gap-2"
              >
                <Shield size={18} />
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted">Loading dashboard data...</p>
        </div>
      );
    }

    if (activeTab === "dashboard") {
      const totalApplications = stats?.totalApplications ?? 0;
      const acceptedCount = stats?.statusCounts?.accepted ?? 0;
      const acceptanceRate = totalApplications
        ? Math.round((acceptedCount / totalApplications) * 100)
        : 0;

      const handleStatusDashboardClick = (status) => {
        setApplicationFilters({ ...emptyApplicationFilters, status });
        setActiveTab("applications");
      };

      return (
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Total Contacts"
              value={stats?.totalContacts ?? 0}
              icon={Mail}
              accent="text-accent"
              hint="Inbound messages"
            />
            <StatCard
              label="Total Applications"
              value={totalApplications}
              icon={UserCheck}
              accent="text-blue-400"
              hint={`${acceptanceRate}% accepted`}
            />
            <StatCard
              label="Active Programs"
              value={stats?.totalPrograms ?? 0}
              icon={BookOpen}
              accent="text-purple-400"
              hint="Live on website"
            />
            <StatCard
              label="Pending Review"
              value={stats?.statusCounts?.pending ?? 0}
              icon={Clock}
              accent="text-yellow-400"
              hint="Awaiting action"
            />
          </div>

          {pendingPayments > 0 && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center shrink-0">
                <BarChart3 className="text-yellow-400" size={20} />
              </div>
              <p className="text-sm text-yellow-100/90 flex-1">
                <strong className="text-yellow-300">{pendingPayments}</strong> application
                {pendingPayments !== 1 ? "s" : ""} awaiting payment verification.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("applications")}
                className="shrink-0 text-sm font-medium px-4 py-2 rounded-xl bg-yellow-500/15 text-yellow-300 border border-yellow-500/25 hover:bg-yellow-500/25 transition"
              >
                Review now
              </button>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <DashboardPanel
              title="Applications per Program"
              subtitle={`${totalApplications} total applications across ${stats?.applicationsPerProgram?.length ?? 0} programs`}
              icon={BarChart3}
              action={
                totalApplications > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("applications")}
                    className="text-xs text-accent hover:underline shrink-0"
                  >
                    View all
                  </button>
                ) : null
              }
            >
              <ProgramBreakdownChart
                items={stats?.applicationsPerProgram}
                totalApplications={totalApplications}
                maxCount={maxProgramCount}
              />
            </DashboardPanel>

            <DashboardPanel
              title="Application Status"
              subtitle="Click a status to filter applications"
              icon={UserCheck}
            >
              <StatusBreakdownChart
                statusCounts={stats?.statusCounts}
                totalApplications={totalApplications}
                onStatusClick={handleStatusDashboardClick}
              />
            </DashboardPanel>
          </div>
        </div>
      );
    }

    if (activeTab === "contacts") {
      const internshipOptions = [
        ...new Set(
          contacts
            .map((contact) => getContactInternship(contact))
            .filter((internship) => internship && internship !== "—")
        ),
      ].sort((a, b) => a.localeCompare(b));

      const filteredContacts = filterContacts(contacts, contactFilters);
      const hasActiveFilters = contactFilters.search || contactFilters.internship;

      return (
        <div className="space-y-6">
          {contacts.length > 0 && (
            <ContactFilters
              filters={contactFilters}
              onChange={setContactFilters}
              internshipOptions={internshipOptions}
              resultCount={filteredContacts.length}
              totalCount={contacts.length}
            />
          )}

          {contacts.length === 0 ? (
            <div className="theme-card p-12 text-center">
              <Mail className="text-subtle mx-auto mb-4" size={40} />
              <p className="text-muted">No contact messages yet.</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="theme-card p-12 text-center">
              <Search className="text-subtle mx-auto mb-4" size={40} />
              <p className="text-fg font-medium mb-1">No matching messages</p>
              <p className="text-muted text-sm mb-4">
                Try a different name, email, WhatsApp digits, or internship filter.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => setContactFilters(emptyContactFilters)}
                  className="text-sm text-accent hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <ContactsTable contacts={filteredContacts} />
          )}
        </div>
      );
    }

    if (activeTab === "applications") {
      const pendingCount = applications.filter(
        (app) => app.payment?.transactionId && app.payment?.status === "pending"
      ).length;

      const programOptions = [
        ...new Set(applications.map((app) => app.program).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b));

      const filteredApplications = filterApplications(applications, applicationFilters);
      const hasActiveFilters =
        applicationFilters.search ||
        applicationFilters.program ||
        applicationFilters.status;

      return (
        <div className="space-y-6">
          {applications.length > 0 && (
            <>
              <ApplicationFilters
                filters={applicationFilters}
                onChange={setApplicationFilters}
                programOptions={programOptions}
                resultCount={filteredApplications.length}
                totalCount={applications.length}
              />

              {pendingCount > 0 && (
                <div className="flex justify-end">
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    {pendingCount} pending payment verification
                  </span>
                </div>
              )}
            </>
          )}

          {applications.length === 0 ? (
            <div className="theme-card p-12 text-center">
              <UserCheck className="text-subtle mx-auto mb-4" size={40} />
              <p className="text-muted">No internship applications yet.</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="theme-card p-12 text-center">
              <Search className="text-subtle mx-auto mb-4" size={40} />
              <p className="text-fg font-medium mb-1">No matching applications</p>
              <p className="text-muted text-sm mb-4">
                Try a different name, phone digits, program, or status.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => setApplicationFilters(emptyApplicationFilters)}
                  className="text-sm text-accent hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <ApplicationsTable
              applications={filteredApplications}
              onStatusChange={handleStatusChange}
              onPaymentStatusChange={handlePaymentStatusChange}
              onDelete={handleDeleteApplication}
              paymentActionId={paymentActionId}
            />
          )}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="theme-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="text-accent" size={22} />
            <h2 className="text-lg font-medium text-fg">Add New Program</h2>
          </div>

              <form onSubmit={handleProgramSubmit} noValidate className="grid md:grid-cols-2 gap-4">
                <FormField error={fieldErrors.title}>
                  <input
                    type="text"
                    name="title"
                    value={editingProgram ? "" : programForm.title}
                    onChange={handleProgramChange}
                    placeholder="Program Title"
                    disabled={!!editingProgram}
                    className={inputClass(fieldErrors.title)}
                  />
                </FormField>

                <FormField error={fieldErrors.duration}>
                  <input
                    type="text"
                    name="duration"
                    value={editingProgram ? "" : programForm.duration}
                    onChange={handleProgramChange}
                    placeholder="Duration (e.g. 8-12 weeks)"
                    disabled={!!editingProgram}
                    className={inputClass(fieldErrors.duration)}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField error={fieldErrors.description}>
                    <textarea
                      name="description"
                      value={editingProgram ? "" : programForm.description}
                      onChange={handleProgramChange}
                      rows="3"
                      placeholder="Program Description"
                      disabled={!!editingProgram}
                      className={inputClass(fieldErrors.description)}
                    />
                  </FormField>
                </div>

                {!editingProgram && (
                  <div className="md:col-span-2">
                    {programStatus.message && (
                      <p className={`text-sm mb-3 ${programStatus.type === "success" ? "text-green-400" : "text-red-400"}`}>
                        {programStatus.message}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={savingProgram}
                      className="theme-btn-primary disabled:opacity-60"
                    >
                      {savingProgram ? "Adding..." : "Add Program"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="space-y-4">
              {programs.length === 0 ? (
                <div className="theme-card p-12 text-center">
                  <BookOpen className="text-subtle mx-auto mb-4" size={40} />
                  <p className="text-muted">No programs yet.</p>
                </div>
              ) : (
                programs.map((program) => (
                  <div
                    key={program._id}
                    className={`backdrop-blur-lg border rounded-2xl p-6 ${
                      program.isActive
                        ? "bg-card border-border"
                        : "bg-surface border-border opacity-70"
                    }`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-fg">{program.title}</h3>
                          {!program.isActive && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-muted text-sm mb-2">{program.duration}</p>
                        <p className="text-muted">{program.description}</p>
                      </div>

                      <div className="flex gap-2">
                        {program.isActive ? (
                          <>
                            <button
                              onClick={() => openEditProgram(program)}
                              className="p-2 rounded-xl bg-card hover:bg-accent/20 text-muted hover:text-accent transition"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProgram(program._id)}
                              className="p-2 rounded-xl bg-card hover:bg-red-500/20 text-muted hover:text-red-400 transition"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestoreProgram(program)}
                            className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 text-sm hover:bg-green-500/30 transition"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
    );
  };

  return (
    <>
      <AdminShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onRefresh={() => loadData(adminKey)}
        loading={loading}
        counts={{
          applications: applications.length,
          contacts: contacts.length,
          programs: programs.length,
        }}
      >
        {error && (
          <p className="text-red-400 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4 text-sm">
            {error}
          </p>
        )}
        {renderContent()}
      </AdminShell>

      {editingProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay px-4">
            <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-8 relative">
              <button
                onClick={closeProgramModal}
                className="absolute top-4 right-4 text-muted hover:text-fg"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-medium text-fg mb-6">Edit Program</h3>

              <form onSubmit={handleProgramSubmit} noValidate className="space-y-4">
                <FormField error={fieldErrors.title}>
                  <input
                    type="text"
                    name="title"
                    value={programForm.title}
                    onChange={handleProgramChange}
                    placeholder="Program Title"
                    className={inputClass(fieldErrors.title)}
                  />
                </FormField>

                <FormField error={fieldErrors.duration}>
                  <input
                    type="text"
                    name="duration"
                    value={programForm.duration}
                    onChange={handleProgramChange}
                    placeholder="Duration"
                    className={inputClass(fieldErrors.duration)}
                  />
                </FormField>

                <FormField error={fieldErrors.description}>
                  <textarea
                    name="description"
                    value={programForm.description}
                    onChange={handleProgramChange}
                    rows="4"
                    placeholder="Description"
                    className={inputClass(fieldErrors.description)}
                  />
                </FormField>

                <label className="flex items-center gap-3 text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={programForm.isActive}
                    onChange={handleProgramChange}
                    className="w-4 h-4 rounded accent-accent"
                  />
                  Active (visible on public site)
                </label>

                {programStatus.message && (
                  <p className={`text-sm ${programStatus.type === "success" ? "text-green-400" : "text-red-400"}`}>
                    {programStatus.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingProgram}
                  className="w-full theme-btn-primary disabled:opacity-60 py-4 font-medium"
                >
                  {savingProgram ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
        </div>
      )}
    </>
  );
}

export default AdminPage;
