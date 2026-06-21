function FormField({ label, error, children }) {
  return (
    <div>
      {label && (
        <label className="block text-sm text-muted mb-1">{label}</label>
      )}
      {children}
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default FormField;
