import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import FormField from "../FormField";
import SelectField from "../SelectField";
import { inputClass } from "../../utils/themeClasses";
import { validateBatchForm } from "../../utils/validation";
import {
  assignApplicationsToBatch,
  createBatch,
  deleteBatch,
  getAdminBatches,
  getBatchUnassignedApplications,
  updateBatch,
} from "../../services/api";

const emptyBatchForm = {
  programId: "",
  name: "",
  startDate: "",
  endDate: "",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function AssignStudentsModal({ batch, adminKey, onClose, onAssigned }) {
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    if (!batch) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !assigning) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [batch, assigning, onClose]);

  useEffect(() => {
    if (!batch?._id || !adminKey) return;

    setLoading(true);
    setError("");
    setSelectedIds(new Set());

    getBatchUnassignedApplications(batch._id, adminKey)
      .then((result) => {
        setApplications(result.data || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load applications");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [batch, adminKey]);

  if (!batch) return null;

  const toggleId = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map((app) => app._id)));
    }
  };

  const handleAssign = async () => {
    if (selectedIds.size === 0) {
      setError("Select at least one student to assign.");
      return;
    }

    setAssigning(true);
    setError("");

    try {
      await assignApplicationsToBatch(batch._id, [...selectedIds], adminKey);
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to assign students");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay px-4 py-8"
      onClick={() => {
        if (!assigning) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Assign students to batch"
    >
      <div
        className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-border shrink-0">
          <div>
            <h3 className="text-lg font-medium text-fg">Assign Students</h3>
            <p className="text-muted text-sm mt-1">
              {batch.name} · {batch.programTitle}
            </p>
            <p className="text-subtle text-xs mt-1">
              {formatDate(batch.startDate)} – {formatDate(batch.endDate)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={assigning}
            className="p-2 rounded-lg text-muted hover:text-fg hover:bg-card transition disabled:opacity-40"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-auto flex-1 min-h-0">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="text-accent animate-spin" size={32} />
              <p className="text-muted text-sm">Loading unassigned applications…</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-fg font-medium mb-1">No unassigned students</p>
              <p className="text-muted text-sm">
                All applications for {batch.programTitle} are already in a batch, or none
                exist yet.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted">
                  {applications.length} unassigned for this course
                </p>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-accent hover:underline"
                >
                  {selectedIds.size === applications.length ? "Clear all" : "Select all"}
                </button>
              </div>

              <ul className="space-y-2">
                {applications.map((app) => {
                  const checked = selectedIds.has(app._id);
                  return (
                    <li key={app._id}>
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          checked
                            ? "border-accent/40 bg-accent/5"
                            : "border-border bg-surface/40 hover:border-accent/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleId(app._id)}
                          className="mt-1 accent-accent"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-fg">{app.fullName}</span>
                            {app.applicationId && (
                              <span className="text-xs font-mono text-accent">
                                {app.applicationId}
                              </span>
                            )}
                          </span>
                          <span className="block text-xs text-muted mt-0.5">
                            {app.email} · {app.phone}
                          </span>
                          {app.college && (
                            <span className="block text-xs text-subtle mt-0.5 line-clamp-1">
                              {app.college}
                            </span>
                          )}
                        </span>
                        <span className="text-xs capitalize text-subtle shrink-0">
                          {app.status}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div className="p-5 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={assigning}
            className="theme-btn-outline px-5 py-2.5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={assigning || loading || applications.length === 0}
            className="theme-btn-primary px-5 py-2.5 inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {assigning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Assigning…
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Assign {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function BatchesSection({ adminKey, programs, onApplicationsChange }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [batchForm, setBatchForm] = useState(emptyBatchForm);
  const [editingBatch, setEditingBatch] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);

  const activePrograms = useMemo(
    () => programs.filter((program) => program.isActive !== false),
    [programs]
  );

  const programOptions = useMemo(
    () => [
      { value: "", label: "All programs" },
      ...activePrograms.map((program) => ({
        value: program._id,
        label: program.title,
      })),
    ],
    [activePrograms]
  );

  const loadBatches = async () => {
    if (!adminKey) return;

    setLoading(true);
    setError("");

    try {
      const result = await getAdminBatches(adminKey, {
        programId: programFilter || undefined,
      });
      setBatches(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [adminKey, programFilter]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setBatchForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setBatchForm(emptyBatchForm);
    setEditingBatch(null);
    setFieldErrors({});
    setStatus({ type: "", message: "" });
  };

  const openEdit = (batch) => {
    setEditingBatch(batch);
    setBatchForm({
      programId: String(batch.programId),
      name: batch.name,
      startDate: toDateInputValue(batch.startDate),
      endDate: toDateInputValue(batch.endDate),
    });
    setFieldErrors({});
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateBatchForm(batchForm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    setStatus({ type: "", message: "" });
    setFieldErrors({});

    try {
      if (editingBatch) {
        await updateBatch(editingBatch._id, batchForm, adminKey);
        setStatus({ type: "success", message: "Batch updated successfully" });
      } else {
        await createBatch(batchForm, adminKey);
        setStatus({ type: "success", message: "Batch created successfully" });
      }

      resetForm();
      await loadBatches();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Failed to save batch",
      });
      if (err.errors) setFieldErrors(err.errors);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (batch) => {
    if (!window.confirm(`Deactivate batch "${batch.name}"?`)) return;

    try {
      await deleteBatch(batch._id, adminKey);
      if (editingBatch?._id === batch._id) resetForm();
      await loadBatches();
    } catch (err) {
      setError(err.message || "Failed to deactivate batch");
    }
  };

  const handleAssigned = async () => {
    await loadBatches();
    if (onApplicationsChange) await onApplicationsChange();
  };

  return (
    <div className="space-y-8">
      <div className="theme-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Plus className="text-accent" size={22} />
            <h2 className="text-lg font-medium text-fg">
              {editingBatch ? "Edit Batch" : "Create Batch"}
            </h2>
          </div>
          {editingBatch && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-muted hover:text-fg"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="grid md:grid-cols-2 gap-4">
          <FormField label="Program" error={fieldErrors.programId}>
            <SelectField
              name="programId"
              value={batchForm.programId}
              onChange={handleFormChange}
              placeholder="Select program"
              hasError={!!fieldErrors.programId}
              options={activePrograms.map((program) => ({
                value: program._id,
                label: program.title,
              }))}
            />
          </FormField>

          <FormField label="Batch Name" error={fieldErrors.name}>
            <input
              type="text"
              name="name"
              value={batchForm.name}
              onChange={handleFormChange}
              placeholder="e.g. Batch A – Jan 2026"
              className={inputClass(!!fieldErrors.name)}
            />
          </FormField>

          <FormField label="Start Date" error={fieldErrors.startDate}>
            <input
              type="date"
              name="startDate"
              value={batchForm.startDate}
              onChange={handleFormChange}
              className={inputClass(!!fieldErrors.startDate)}
            />
          </FormField>

          <FormField label="End Date" error={fieldErrors.endDate}>
            <input
              type="date"
              name="endDate"
              value={batchForm.endDate}
              onChange={handleFormChange}
              className={inputClass(!!fieldErrors.endDate)}
            />
          </FormField>

          <div className="md:col-span-2">
            {status.message && (
              <p
                className={`text-sm mb-3 ${
                  status.type === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {status.message}
              </p>
            )}
            <button
              type="submit"
              disabled={saving || activePrograms.length === 0}
              className="theme-btn-primary disabled:opacity-60"
            >
              {saving
                ? "Saving…"
                : editingBatch
                  ? "Update Batch"
                  : "Create Batch"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-fg flex items-center gap-2">
            <Layers className="text-accent" size={20} />
            Batches by Course
          </h2>
          <p className="text-muted text-sm mt-1">
            Set internship dates once per batch, then assign students from unassigned
            applications.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <SelectField
            name="programFilter"
            value={programFilter}
            onChange={(event) => setProgramFilter(event.target.value)}
            placeholder="All programs"
            options={programOptions}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="text-accent animate-spin" size={32} />
          <p className="text-muted text-sm">Loading batches…</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="theme-card p-12 text-center">
          <Layers className="text-subtle mx-auto mb-4" size={40} />
          <p className="text-muted">No batches yet.</p>
          <p className="text-subtle text-sm mt-2">
            Create a batch above to group students and set their internship dates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => (
            <div
              key={batch._id}
              className={`backdrop-blur-lg border rounded-2xl p-6 ${
                batch.isActive
                  ? "bg-card border-border"
                  : "bg-surface border-border opacity-70"
              }`}
            >
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-fg">{batch.name}</h3>
                    {!batch.isActive && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-accent text-sm font-medium mb-2">{batch.programTitle}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} className="text-subtle" />
                      {formatDate(batch.startDate)} – {formatDate(batch.endDate)}
                    </span>
                    <span>
                      <span className="text-fg font-medium">{batch.studentCount ?? 0}</span>{" "}
                      student{(batch.studentCount ?? 0) === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                {batch.isActive && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignTarget(batch)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm bg-accent/10 text-accent border border-accent/25 hover:bg-accent/20 transition"
                    >
                      <UserPlus size={16} />
                      Assign students
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(batch)}
                      className="p-2 rounded-xl bg-card hover:bg-accent/20 text-muted hover:text-accent transition"
                      title="Edit batch"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeactivate(batch)}
                      className="p-2 rounded-xl bg-card hover:bg-red-500/20 text-muted hover:text-red-400 transition"
                      title="Deactivate batch"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AssignStudentsModal
        batch={assignTarget}
        adminKey={adminKey}
        onClose={() => setAssignTarget(null)}
        onAssigned={handleAssigned}
      />
    </div>
  );
}

export default BatchesSection;
