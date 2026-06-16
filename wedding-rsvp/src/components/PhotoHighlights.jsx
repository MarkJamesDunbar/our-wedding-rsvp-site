export default function PhotoHighlights({ items }) {
  return (
    <section className="card photo-highlights-section">
      <p className="eyebrow">Gallery</p>
      <h2>Venue and moments</h2>
      <div className="photo-highlights-grid">
        {items.map((item, idx) => (
          <div
            key={item.label}
            className={`photo-highlight photo-highlight-${idx + 1}`}
            role="img"
            aria-label={item.alt}
          >
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
