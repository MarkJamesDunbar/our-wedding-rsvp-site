import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CircularText from '../components/CircularText';
import bouquetCream from '../assets/designs/bouquet_cream.png';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('id');
  const declined = searchParams.get('attending') === 'none';

  useEffect(() => {
    const CONFIRMATION_INSET_COLOR = '#571216';
    const previousHtmlBackgroundColor = document.documentElement.style.backgroundColor;
    const previousBodyBackgroundColor = document.body.style.backgroundColor;
    const rootNode = document.getElementById('root');
    const previousRootBackgroundColor = rootNode?.style.backgroundColor || '';
    const appShellNode = document.querySelector('.app-shell');
    const previousAppShellBackgroundColor = appShellNode instanceof HTMLElement
      ? appShellNode.style.backgroundColor
      : '';
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const previousThemeColor = themeMeta?.getAttribute('content') || '';

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    document.documentElement.style.backgroundColor = CONFIRMATION_INSET_COLOR;
    document.body.style.backgroundColor = CONFIRMATION_INSET_COLOR;
    if (rootNode) {
      rootNode.style.backgroundColor = CONFIRMATION_INSET_COLOR;
    }
    if (appShellNode instanceof HTMLElement) {
      appShellNode.style.backgroundColor = CONFIRMATION_INSET_COLOR;
    }
    themeMeta?.setAttribute('content', CONFIRMATION_INSET_COLOR);

    return () => {
      document.documentElement.style.backgroundColor = previousHtmlBackgroundColor;
      document.body.style.backgroundColor = previousBodyBackgroundColor;
      if (rootNode) {
        rootNode.style.backgroundColor = previousRootBackgroundColor;
      }
      if (appShellNode instanceof HTMLElement) {
        appShellNode.style.backgroundColor = previousAppShellBackgroundColor;
      }
      if (themeMeta) {
        themeMeta.setAttribute('content', previousThemeColor || '#571216');
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/invite?id=${invitationId}`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, invitationId]);

  return (
    <div className="page page-center confirmation-page">
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
          <img
            src={bouquetCream}
            alt=""
            className="confirmation-crest-bouquet"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  );
}