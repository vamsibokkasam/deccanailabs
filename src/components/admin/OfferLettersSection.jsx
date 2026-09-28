import { useEffect, useState } from "react";
import { Download, Eye, FileText, Loader2, Mail } from "lucide-react";
import SelectField from "../SelectField";
import {
  fetchOfferLetter,
  getIssuedOfferLetters,
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

function OfferLettersSection({ adminKey, reloadKey = 0 }) {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    getIssuedOfferLetters(adminKey)
      .then((result) => {
        if (cancelled) return;
        setPrograms(result.data || []);
        setCount(result.count || 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load offer letters");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adminKey, reloadKey]);

  const selectedProgram = programs.find((program) => program._id === selectedProgramId) || null;

  const openPdf = async (letter, download) => {
    setActionId(`${download ? "download" : "view"}:${letter.applicationId}`);
    setError("");
    try {
      const { blob, filename } = await fetchOfferLetter(letter.applicationId, adminKey);
      openCertificatePdfBlob(blob, {
        download,
        filename: filename || letter.filename || "Offer-Letter.pdf",
      });
    } catch (err) {
      setError(err.message || "Failed to open offer letter PDF");
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-fg flex items-center gap-2">
          <FileText className="text-accent" size={20} />
          Offer Letters by Program
        </h2>
        <p className="text-muted text-sm mt-1">
          Offer letters that were generated and emailed successfully.
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
          <p className="text-muted text-sm">Loading offer letters…</p>
        </div>
      ) : count === 0 ? (
        <div className="theme-card p-12 text-center">
          <FileText className="text-subtle mx-auto mb-4" size={40} />
          <p className="text-muted">No emailed offer letters yet.</p>
          <p className="text-subtle text-sm mt-2">
            Accept an application and send the offer letter email to list it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="theme-card rounded-2xl p-6">
            <label className="block text-sm text-muted mb-2">Select program</label>
            <div className="max-w-md">
              <SelectField
                name="offer-letter-program"
                value={selectedProgramId}
                onChange={(event) => setSelectedProgramId(event.target.value)}
                placeholder="Choose a program"
                options={programs.map((program) => ({
                  value: program._id,
                  label: `${program.name} (${program.offerLetters.length})`,
                }))}
              />
            </div>
          </div>

          {!selectedProgram ? (
            <div className="theme-card p-12 text-center">
              <FileText className="text-subtle mx-auto mb-4" size={40} />
              <p className="text-muted">Select a program to view its offer letters.</p>
            </div>
          ) : (
            <div className="theme-card rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-medium text-fg">{selectedProgram.name}</h3>
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  {selectedProgram.offerLetters.length} offer letter
                  {selectedProgram.offerLetters.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-subtle text-xs uppercase tracking-wider">
                      <th className="py-2 pr-4 font-medium">Student</th>
                      <th className="py-2 pr-4 font-medium">Application ID</th>
                      <th className="py-2 pr-4 font-medium">Batch</th>
                      <th className="py-2 pr-4 font-medium">College</th>
                      <th className="py-2 pr-4 font-medium">Emailed</th>
                      <th className="py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProgram.offerLetters.map((letter) => {
                      const viewing = actionId === `view:${letter.applicationId}`;
                      const downloading = actionId === `download:${letter.applicationId}`;
                      return (
                        <tr key={letter._id} className="border-b border-border/70 last:border-0">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-fg">{letter.recipientName}</p>
                            <p className="text-xs text-muted mt-0.5 inline-flex items-center gap-1">
                              <Mail size={12} />
                              {letter.email || "—"}
                            </p>
                          </td>
                          <td className="py-3 pr-4 text-accent font-mono text-xs whitespace-nowrap">
                            {letter.applicationRef || "—"}
                          </td>
                          <td className="py-3 pr-4 text-muted whitespace-nowrap">
                            {letter.batchName || "—"}
                          </td>
                          <td className="py-3 pr-4 text-muted max-w-[180px]">
                            <span className="line-clamp-2">{letter.college || "—"}</span>
                          </td>
                          <td className="py-3 pr-4 text-muted text-xs whitespace-nowrap">
                            {formatDate(letter.emailedAt)}
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1">
                              <button
                                type="button"
                                onClick={() => openPdf(letter, false)}
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
                                onClick={() => openPdf(letter, true)}
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

export default OfferLettersSection;
