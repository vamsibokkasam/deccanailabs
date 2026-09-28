import { useEffect, useState } from "react";
import { Award, Calendar, Download, Eye, Loader2, Mail } from "lucide-react";
import SelectField from "../SelectField";
import {
  fetchCertificatePdf,
  getIssuedCertificates,
  openCertificatePdfBlob,
} from "../../services/api";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function certificateFilename(certNo) {
  return `${String(certNo || "certificate").replace(/\//g, "-")}.pdf`;
}

function CertificatesSection({ adminKey, reloadKey = 0 }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    getIssuedCertificates(adminKey)
      .then((result) => {
        if (cancelled) return;
        setBatches(result.data || []);
        setCount(result.count || 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load certificates");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adminKey, reloadKey]);

  const selectedBatch = batches.find((batch) => batch._id === selectedBatchId) || null;

  const openPdf = async (certNo, download) => {
    setActionId(`${download ? "download" : "view"}:${certNo}`);
    setError("");
    try {
      const blob = await fetchCertificatePdf(certNo, adminKey, { download });
      openCertificatePdfBlob(blob, {
        download,
        filename: certificateFilename(certNo),
      });
    } catch (err) {
      setError(err.message || "Failed to open certificate PDF");
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-fg flex items-center gap-2">
          <Award className="text-accent" size={20} />
          Certificates by Batch
        </h2>
        <p className="text-muted text-sm mt-1">
          Certificates that were generated and emailed successfully.
        </p>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="text-accent animate-spin" size={32} />
          <p className="text-muted text-sm">Loading certificates…</p>
        </div>
      ) : count === 0 ? (
        <div className="theme-card p-12 text-center">
          <Award className="text-subtle mx-auto mb-4" size={40} />
          <p className="text-muted">No emailed certificates yet.</p>
          <p className="text-subtle text-sm mt-2">
            Complete an application and send the certificate email to list it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="theme-card rounded-2xl p-6">
            <label className="block text-sm text-muted mb-2" htmlFor="certificate-batch">
              Select batch
            </label>
            <div className="max-w-md">
              <SelectField
                name="certificate-batch"
                value={selectedBatchId}
                onChange={(event) => setSelectedBatchId(event.target.value)}
                placeholder="Choose a batch"
                options={batches.map((batch) => ({
                  value: batch._id,
                  label: `${batch.name}${batch.programTitle ? ` · ${batch.programTitle}` : ""} (${batch.certificates.length})`,
                }))}
              />
            </div>
          </div>

          {!selectedBatch ? (
            <div className="theme-card p-12 text-center">
              <Award className="text-subtle mx-auto mb-4" size={40} />
              <p className="text-muted">Select a batch to view its certificates.</p>
            </div>
          ) : (
            <div key={selectedBatch._id} className="theme-card rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-medium text-fg">{selectedBatch.name}</h3>
                  {selectedBatch.programTitle && (
                    <p className="text-accent text-sm font-medium mt-1">{selectedBatch.programTitle}</p>
                  )}
                  {selectedBatch.startDate && selectedBatch.endDate && (
                    <p className="text-muted text-sm mt-2 inline-flex items-center gap-1.5">
                      <Calendar size={14} className="text-subtle" />
                      {formatDate(selectedBatch.startDate)} – {formatDate(selectedBatch.endDate)}
                    </p>
                  )}
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  {selectedBatch.certificates.length} certificate
                  {selectedBatch.certificates.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-subtle text-xs uppercase tracking-wider">
                      <th className="py-2 pr-4 font-medium">Student</th>
                      <th className="py-2 pr-4 font-medium">Certificate ID</th>
                      <th className="py-2 pr-4 font-medium">College</th>
                      <th className="py-2 pr-4 font-medium">Emailed</th>
                      <th className="py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBatch.certificates.map((certificate) => {
                      const viewing = actionId === `view:${certificate.certNo}`;
                      const downloading = actionId === `download:${certificate.certNo}`;
                      return (
                        <tr key={certificate._id} className="border-b border-border/70 last:border-0">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-fg">{certificate.recipientName}</p>
                            <p className="text-xs text-muted mt-0.5 inline-flex items-center gap-1">
                              <Mail size={12} />
                              {certificate.email || "—"}
                            </p>
                          </td>
                          <td className="py-3 pr-4 text-accent font-mono text-xs whitespace-nowrap">
                            {certificate.certNo}
                          </td>
                          <td className="py-3 pr-4 text-muted max-w-[180px]">
                            <span className="line-clamp-2">{certificate.college || "—"}</span>
                          </td>
                          <td className="py-3 pr-4 text-muted text-xs whitespace-nowrap">
                            {formatDate(certificate.emailedAt)}
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1">
                              <button
                                type="button"
                                onClick={() => openPdf(certificate.certNo, false)}
                                disabled={Boolean(actionId)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border border-border text-fg hover:border-accent/40 transition disabled:opacity-40"
                              >
                                {viewing ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Eye size={12} />
                                )}
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => openPdf(certificate.certNo, true)}
                                disabled={Boolean(actionId)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border border-border text-fg hover:border-accent/40 transition disabled:opacity-40"
                              >
                                {downloading ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Download size={12} />
                                )}
                                Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CertificatesSection;
