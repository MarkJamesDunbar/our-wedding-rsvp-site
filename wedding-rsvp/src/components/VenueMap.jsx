export default function VenueMap({ title, mapEmbedUrl }) {
  return (
    <div className="venue-map-wrap">
      <iframe
        title={title}
        src={mapEmbedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="venue-map"
      />
    </div>
  );
}
