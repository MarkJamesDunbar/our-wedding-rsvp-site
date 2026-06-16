import { useNavigate } from 'react-router-dom';
import { weddingDetails } from '../data/weddingDetails';

export default function HomePage({ invitation }) {
  const navigate = useNavigate();
  const hasRsvpd = invitation.has_responded;
  const weddingDate = new Date(weddingDetails.weddingDateIso);

  function ordinalDay(day) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = day % 100;
    return `${day}${suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]}`;
  }

  const displayDate = `${weddingDate.toLocaleDateString(undefined, { month: 'long' })} ${ordinalDay(weddingDate.getDate())} ${weddingDate.getFullYear()}`;
  const coupleNames = weddingDetails.coupleNames;
  const [firstName, secondName] = coupleNames.split(' & ');
  const locationLabel = 'Isle of Bute, Scotland';

  return (
    <div className="page landing-page">
      <section className="invite-sheet" aria-label="Wedding invitation hero">
        <span className="corner corner-top-left" aria-hidden="true" />
        <span className="corner corner-top-right" aria-hidden="true" />
        <span className="corner corner-bottom-left" aria-hidden="true" />
        <span className="corner corner-bottom-right" aria-hidden="true" />

        <div className="invite-center">
          <p className="invite-lead">Join us for the Wedding of</p>
          <h1>{firstName} & {secondName}</h1>
          <p className="invite-date">{displayDate}</p>
          <p className="invite-place">{locationLabel}</p>
        </div>

        <button
          className="rsvp-outline invite-rsvp-button"
          onClick={() => navigate(`/invite/rsvp?id=${invitation.qr_code}`)}
        >
            {hasRsvpd ? 'UPDATE RSVP' : 'RSVP'}
        </button>
      </section>

    </div>
  );
}