import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CircularText from '../components/CircularText';
import bouquet from '../assets/designs/bouquet.png';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('id');
  const declined = searchParams.get('attending') === 'none';

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/invite?id=${invitationId}`);
    }, 6000);

    return () => clearTimeout(timer);
  }, [navigate, invitationId]);

  return (
    <div className="page page-center confirmation-page single-page-shell">
      <div className="confirmation-thanks" role="status" aria-live="polite">
        <p className="confirmation-script">
          Thanks for letting us know!
          <br />
          {declined ? "We'll miss you </3" : "We'll see you soon"}
        </p>

        <div className="confirmation-crest" aria-hidden="true">
          <CircularText
            text="MOUNT STUART * ISLE OF BUTE * SCOTLAND * 26TH JUNE 2027 * "
            spinDuration={42}
            characterOffset="0%"
          />
          <img src={bouquet} alt="" className="confirmation-crest-bouquet" />
        </div>
      </div>
    </div>
  );
}