import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import ClickSpark from './components/ClickSpark';
import bouquetCream from './assets/designs/bouquet_cream.png';
import CircularText from './components/CircularText';
import HomePage from './pages/HomePage';
import RSVPForm from './pages/RSVPForm';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminPortal from './pages/AdminPortal';
import { courses } from './data/menuOptions';
import { apiPath } from './config/api';
import localInvitations from './data/invitations.json';

const RESPONSE_STORAGE_PREFIX = 'rsvp-response:';
const localInvitationEntries = Object.values(localInvitations);

function canUseLocalResponseFallback() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

function ConfirmationStyleStatusPage({ message, detail, className = '' }) {
  useEffect(() => {
    const STATUS_INSET_COLOR = '#571216';
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
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlScrollSnapType = document.documentElement.style.scrollSnapType;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.documentElement.style.backgroundColor = STATUS_INSET_COLOR;
    document.body.style.backgroundColor = STATUS_INSET_COLOR;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.scrollSnapType = 'none';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    if (rootNode) {
      rootNode.style.backgroundColor = STATUS_INSET_COLOR;
    }
    if (appShellNode instanceof HTMLElement) {
      appShellNode.style.backgroundColor = STATUS_INSET_COLOR;
    }
    themeMeta?.setAttribute('content', STATUS_INSET_COLOR);

    return () => {
      document.documentElement.style.backgroundColor = previousHtmlBackgroundColor;
      document.body.style.backgroundColor = previousBodyBackgroundColor;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.scrollSnapType = previousHtmlScrollSnapType;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;

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

  return (
    <div className={`page page-center confirmation-page ${className}`.trim()}>
      <div className="confirmation-thanks" role="status" aria-live="polite">
        <p className="confirmation-script">
          {message}
          {detail ? (
            <>
              <br />
              {detail}
            </>
          ) : null}
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

function LoadingPagePreview() {
  return <ConfirmationStyleStatusPage message="getting your invitation" className="loading-status-page" />;
}

async function loadInvitation(invitationId) {
  try {
    const res = await fetch(apiPath(`/api/invitation/${invitationId}`));
    if (!res.ok) {
      throw new Error('Invitation lookup failed');
    }

    return await res.json();
  } catch {
    const fallback = localInvitations[invitationId]
      || localInvitationEntries.find((invitation) => invitation.public_token === invitationId);
    if (!fallback) {
      return null;
    }

    return {
      qr_code: fallback.qr_code,
      public_token: fallback.public_token,
      invite_id: fallback.invite_id,
      primary_guest: fallback.primary_guest,
      party_size: fallback.party_size,
      guests: fallback.guests,
      has_responded: false,
      response: null
    };
  }
}

async function loadResponse(invitationId) {
  try {
    const res = await fetch(apiPath(`/api/get-response/${invitationId}`));
    if (!res.ok) {
      throw new Error('Response lookup failed');
    }
    const data = await res.json();
    return data ? data.data : null;
  } catch {
    if (!canUseLocalResponseFallback()) {
      throw new Error('Response lookup failed');
    }

    const key = `${RESPONSE_STORAGE_PREFIX}${invitationId}`;
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : null;
  }
}

async function saveResponse(invitationId, responses) {
  try {
    const res = await fetch(apiPath('/api/save-response'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitation_id: invitationId, response_data: responses })
    });

    if (!res.ok) {
      throw new Error('Save failed');
    }
  } catch {
    if (!canUseLocalResponseFallback()) {
      throw new Error('Save failed');
    }

    const key = `${RESPONSE_STORAGE_PREFIX}${invitationId}`;
    localStorage.setItem(key, JSON.stringify(responses));
  }
}

function AppContent() {
  const [searchParams] = useSearchParams();
  const invitationLookupKey = searchParams.get('id');
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(Boolean(invitationLookupKey));
  const LOADING_DEBUG_DELAY_MS = 3000;

  useEffect(() => {
    const image = new Image();
    image.src = bouquetCream;
  }, []);

  useEffect(() => {
    if (!invitationLookupKey) {
      setInvitation(null);
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const data = await loadInvitation(invitationLookupKey);
        if (!data) {
          setInvitation(null);
          setLoading(false);
          return;
        }

        const savedResponse = await loadResponse(data.qr_code);
        if (savedResponse) {
          setInvitation({ ...data, has_responded: true, response: savedResponse });
        } else {
          setInvitation(data);
        }
      } catch (err) {
        console.error(err);
        setInvitation(null);
      } finally {
        await new Promise((resolve) => setTimeout(resolve, LOADING_DEBUG_DELAY_MS));
        setLoading(false);
      }
    }

    loadData();
  }, [invitationLookupKey]);

  const handleRsvpSubmit = async (responses) => {
    await saveResponse(invitation.qr_code, responses);
    setInvitation((prev) => ({ ...prev, has_responded: true, response: responses }));
  };

  return (
    <div className="app-shell">
      <div className="app-content">
        <Routes>
          <Route path="/admin" element={<AdminPortal />} />

          {!loading && !invitationLookupKey && (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/invite" element={<HomePage />} />
              <Route path="*" element={<HomePage />} />
            </>
          )}

          {invitation && !loading && (
            <>
              <Route path="/" element={<HomePage invitation={invitation} />} />
              <Route path="/invite" element={<HomePage invitation={invitation} />} />
              <Route
                path="/rsvp"
                element={
                  <RSVPForm invitation={invitation} courses={courses} onSubmit={handleRsvpSubmit} />
                }
              />
              <Route
                path="/invite/rsvp"
                element={
                  <RSVPForm invitation={invitation} courses={courses} onSubmit={handleRsvpSubmit} />
                }
              />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/invite/confirmation" element={<ConfirmationPage />} />
            </>
          )}

          {loading && (
            <Route
              path="*"
              element={<LoadingPagePreview />}
            />
          )}

          {!loading && invitationLookupKey && !invitation && (
            <Route
              path="*"
              element={
                <ConfirmationStyleStatusPage
                  message="Invalid Link"
                  detail="Please check your invite QR code and try again. (Or reach out to Mark <3)"
                />
              }
            />
          )}
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ClickSpark sparkColor="#8e1f1d" sparkSize={12} sparkRadius={18} sparkCount={9}>
        <AppContent />
      </ClickSpark>
    </BrowserRouter>
  );
}