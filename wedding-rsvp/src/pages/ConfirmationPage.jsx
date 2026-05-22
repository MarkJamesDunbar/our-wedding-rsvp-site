import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('id');

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/invite?id=${invitationId}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, invitationId]);

  return (
    <div>
      <h1>✓ Thank you!</h1>
      <p>We've got your RSVP. Redirecting...</p>
    </div>
  );
}