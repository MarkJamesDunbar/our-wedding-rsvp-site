import { useNavigate } from 'react-router-dom';

export default function HomePage({ invitation }) {
  const navigate = useNavigate();
  const hasRsvpd = invitation.has_responded;
  const weddingDate = new Date("2024-12-31");
  const daysUntil = Math.ceil((weddingDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      {hasRsvpd ? (
        <>
          <h1>✓ You're going!</h1>
          <p>Wedding in {daysUntil} days</p>

          {invitation.response && (
        <div style={{ marginBottom: '20px' }}>
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
      <p>Generic event info goes here...</p>
    </div>
  );
}