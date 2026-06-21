function SectionTitle({ label, title, description }) {
  return (
    <div className="text-center mb-16">
      <p className="theme-label mb-4">{label}</p>
      <h2 className="theme-heading">{title}</h2>
      {description && (
        <p className="mt-6 text-lg text-muted max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionTitle;
