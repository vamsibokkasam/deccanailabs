import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import {
  downloadPublicCertificatePdf,
  getPublicCertificateImageUrl,
  getPublicCertificatePdfUrl,
  openCertificatePdfBlob,
  searchCertificates,
} from "../services/api";

function certificateFilename(certNo) {
  return `${String(certNo || "certificate").replace(/\//g, "-")}.pdf`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CertificateVerifyPage() {
  const params = useParams();

  // Support /verify/DCAL-13072026-A041 and legacy /verify/DAIL/CERT/2026/002
  const normalizedCertNo = (() => {
    const raw = decodeURIComponent(params["*"] || "").replace(/\/+$/, "");
    const legacyMatch = raw.match(/^DAIL-CERT-(\d{4})-(\d+)$/i);
    if (legacyMatch) {
      return `DAIL/CERT/${legacyMatch[1]}/${legacyMatch[2].padStart(3, "0")}`;
    }
    return raw;
  })();

  const [query, setQuery] = useState(normalizedCertNo);
  const [searched, setSearched] = useState(Boolean(normalizedCertNo));
  const [loading, setLoading] = useState(Boolean(normalizedCertNo));
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [visibleCertificate, setVisibleCertificate] = useState("");
  const [downloadBusy, setDownloadBusy] = useState("");

  const runSearch = async (searchValue) => {
    const value = searchValue.trim();
    if (value.length < 3) {
      setError("Enter an email, application ID, registration number, or certificate ID.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");
    setVisibleCertificate("");

    try {
      const response = await searchCertificates(value);
      setResults(response.data || []);
    } catch (err) {
      setResults([]);
      setError(err.message || "Certificate search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (normalizedCertNo) runSearch(normalizedCertNo);
    // Run only when the QR/path certificate changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedCertNo]);

  const handleSubmit = (event) => {
    event.preventDefault();
    runSearch(query);
  };

  const handleDownloadPdf = async (certNo) => {
    setDownloadBusy(certNo);
    setError("");

    try {
      const blob = await downloadPublicCertificatePdf(certNo, {
        download: true,
      });
      openCertificatePdfBlob(blob, {
        download: true,
        filename: certificateFilename(certNo),
      });
    } catch (err) {
      setError(err.message || "Failed to download certificate PDF");
    } finally {
      setDownloadBusy("");
    }
  };

  return (
    <section className="px-4 py-12 md:px-6 md:py-16 bg-bg min-h-[75vh]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="theme-label mb-3">Official Verification</p>
          <h1 className="theme-heading text-3xl md:text-4xl">
            Certificate Validation Portal
          </h1>
          <p className="text-muted mt-3">
            Search using an email, application ID, registration number, or certificate ID.
          </p>
        </div>

        <div className="theme-card p-5 md:p-8 min-h-[420px]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Email, application ID, registration no. or certificate ID"
              className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-fg placeholder:text-subtle outline-none focus:border-accent"
              aria-label="Search certificates"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-white font-medium hover:bg-accent-hover transition disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Search
            </button>
          </form>

          {error && (
            <p className="mt-5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {!loading && searched && !error && (
            <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300 text-sm flex items-center gap-2">
              <CheckCircle2 size={17} />
              Successfully found {results.length} certificate{results.length === 1 ? "" : "s"}.
            </div>
          )}

          <div className="mt-6 space-y-5">
            {results.map((certificate) => (
              <CertificateResult
                key={certificate.certNo}
                certificate={certificate}
                expanded={visibleCertificate === certificate.certNo}
                downloadBusy={downloadBusy === certificate.certNo}
                onToggle={() =>
                  setVisibleCertificate((current) =>
                    current === certificate.certNo ? "" : certificate.certNo
                  )
                }
                onDownload={() => handleDownloadPdf(certificate.certNo)}
              />
            ))}
          </div>

          {!loading && searched && !error && results.length === 0 && (
            <div className="py-12 text-center">
              <XCircle className="mx-auto text-muted mb-3" size={36} />
              <p className="text-fg font-medium">No certificate found</p>
              <p className="text-muted text-sm mt-1">Check the entered details and try again.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CertificateResult({
  certificate,
  expanded,
  downloadBusy,
  onToggle,
  onDownload,
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface overflow-hidden shadow-lg">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              {certificate.valid ? (
                <CheckCircle2 className="text-green-400" size={20} />
              ) : (
                <ShieldAlert className="text-red-400" size={20} />
              )}
              <h2 className="text-lg font-medium text-fg">Certificate Details</h2>
            </div>
            <p className="text-accent font-mono text-xs mt-2">{certificate.certNo}</p>
            {certificate.internId && certificate.internId !== certificate.certNo && (
              <p className="text-subtle text-xs mt-1">App ID: {certificate.internId}</p>
            )}
          </div>
          <span
            className={`self-start rounded-full border px-3 py-1 text-xs ${
              certificate.valid
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {certificate.valid ? "Verified" : "Revoked"}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <ResultField label="Certificate / Application ID" value={certificate.certNo} />
          <ResultField label="Candidate Name" value={certificate.recipientName} />
          <ResultField label="Email" value={certificate.email || "—"} />
          <ResultField label="Registration No." value={certificate.registrationNo || "—"} />
          <ResultField label="College" value={certificate.college || "—"} />
          <ResultField label="Department" value={certificate.department || "—"} />
          <ResultField label="Internship / Course" value={certificate.internshipDomain} />
          <ResultField
            label="Internship Period"
            value={`${formatDate(certificate.startDate)} – ${formatDate(certificate.endDate)}`}
          />
        </div>

        {certificate.valid && (
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-accent hover:border-accent/40 transition"
            >
              <Eye size={16} />
              {expanded ? "Hide Certificate" : "View Certificate"}
            </button>
            <button
              type="button"
              onClick={onDownload}
              disabled={downloadBusy}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition disabled:opacity-60"
            >
              {downloadBusy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Download Certificate
            </button>
          </div>
        )}
      </div>

      {expanded && certificate.valid && (
        <div className="border-t border-border bg-white p-2 md:p-4">
          <object
            data={getPublicCertificatePdfUrl(certificate.certNo)}
            type="application/pdf"
            className="block w-full aspect-[1.414] min-h-[280px] bg-white"
            aria-label={`Certificate ${certificate.certNo}`}
          >
            <img
              src={getPublicCertificateImageUrl(certificate.certNo)}
              alt={`Certificate ${certificate.certNo}`}
              className="block w-full h-auto object-contain"
            />
          </object>
        </div>
      )}
    </article>
  );
}

function ResultField({ label, value }) {
  return (
    <div>
      <p className="text-subtle text-xs uppercase tracking-wider">{label}</p>
      <p className="text-fg mt-1 break-words">{value}</p>
    </div>
  );
}

export default CertificateVerifyPage;
