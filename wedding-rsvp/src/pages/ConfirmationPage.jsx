import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('id');

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/invite?id=${invitationId}`);
    }, 4500);

    return () => clearTimeout(timer);
  }, [navigate, invitationId]);

  return (
    <div className="page page-center confirmation-page">
      <div className="card confirmation-card">
        <div className="confirmation-status" role="status" aria-live="polite">
          <span className="confirmation-check" aria-hidden="true">✓</span>
          <h1>You're all set!</h1>
          <p className="confirmation-message">Thanks for RSVPing. We’re updating your response now.</p>
        </div>

        <div className="confirmation-loading" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}