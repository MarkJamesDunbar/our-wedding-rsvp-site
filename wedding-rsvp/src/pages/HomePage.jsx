import { useNavigate } from 'react-router-dom';
import { weddingDetails } from '../data/weddingDetails';

export default function HomePage({ invitation }) {
  const navigate = useNavigate();
  const hasRsvpd = invitation.has_responded;
  const weddingDate = new Date(weddingDetails.weddingDateIso);
  const daysUntil = Math.max(
    0,
    Math.ceil((weddingDate - new Date()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="page">
      <p className="eyebrow">{weddingDetails.coupleNames}</p>
      {hasRsvpd ? (
        <>
          <h1>✓ You're going!</h1>
          <p className="lead">Wedding in {daysUntil} days</p>

          {invitation.response && (
        <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Your Response:</h3>
            {invitation.response.map((guest, idx) => (
            <div key={idx}>
                <p><strong>✓ {guest.name}</strong></p>
            </div>
            ))}
        </div>
)}

          <button onClick={() => navigate(`/invite/rsvp?id=${invitation.qr_code}`)}>Edit Your Choices</button>
        </>
      ) : (
        <button onClick={() => navigate(`/invite/rsvp?id=${invitation.qr_code}`)}>RSVP Now</button>
      )}

      <hr />

      <h2>About the Wedding</h2>

      <div className="card info-block">
        <p><strong>Date:</strong> {weddingDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Venue:</strong> {weddingDetails.venue.name}</p>
        <p><strong>Location:</strong> {weddingDetails.venue.address}</p>
        {weddingDetails.schedule.map((item) => (
          <p key={item}>{item}</p>
        ))}
        <p>{weddingDetails.note}</p>
      </div>
    </div>
  );
}