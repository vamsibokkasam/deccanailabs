function LegalPageLayout({ label, title, children }) {
  return (
    <section className="theme-section">
      <div className="max-w-4xl mx-auto">
        <div className="theme-card rounded-3xl p-8 md:p-12">
          <p className="theme-label mb-4">{label}</p>
          <h1 className="theme-heading mb-10">{title}</h1>
          <div className="space-y-8 text-muted leading-relaxed">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-medium text-fg mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function LegalSubSection({ title, children }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-fg mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function LegalList({ items }) {
  return (
    <ul className="list-disc list-inside space-y-2 pl-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default LegalPageLayout;
