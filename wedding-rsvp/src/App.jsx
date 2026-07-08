import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import ClickSpark from './components/ClickSpark';
import rsvpDesign from './assets/designs/rsvp.webp';
import HomePage from './pages/HomePage';
import RSVPForm from './pages/RSVPForm';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminPortal from './pages/AdminPortal';
import { courses } from './data/menuOptions';
import { apiPath } from './config/api';
import localInvitations from './data/invitations.json';

const RESPONSE_STORAGE_PREFIX = 'rsvp-response:';

function LoadingPagePreview() {
  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlScrollSnapType = document.documentElement.style.scrollSnapType;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.scrollSnapType = 'none';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.scrollSnapType = previousHtmlScrollSnapType;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
    };
  }, []);

  return (
    <div className="page landing-page loading-preview-page">
      <section
        className="landing-hero loading-preview-hero"
        aria-label="Wedding invitation hero"
        data-inset-color="#bababa"
      >
        <div className="loading-preview-status-wrap">
          <div className="card confirmation-card status-card loading-preview-status-card">
            <span className="landing-accommodation-corner landing-accommodation-corner-tl" aria-hidden="true" />
            <span className="landing-accommodation-corner landing-accommodation-corner-br" aria-hidden="true" />

            <h1>getting your invitation</h1>
            <p>Just a moment while we fetch your details.</p>
          </div>
        </div>

        <div className="landing-card-wrap loading-preview-card-wrap">
          <img
            className="landing-invite-card loading-preview-card"
            src={rsvpDesign}
            alt="RSVP details for Alyza and Mark's wedding"
          />
        </div>
      </section>

      <div
        className="landing-page-gap landing-page-gap-first landing-page-gap-before-carousel"
        aria-hidden="true"
      />
    </div>
  );
}

async function loadInvitation(invitationId) {
  try {
    const res = await fetch(apiPath(`/api/invitation/${invitationId}`));
    if (!res.ok) {
      throw new Error('Invitation lookup failed');
    }

    return await res.json();
  } catch {
    const fallback = localInvitations[invitationId];
    if (!fallback) {
      return null;
    }

    return {
      qr_code: fallback.qr_code,
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
    const key = `${RESPONSE_STORAGE_PREFIX}${invitationId}`;
    localStorage.setItem(key, JSON.stringify(responses));
  }
}

function AppContent() {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('id');
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(Boolean(invitationId));
  const LOADING_DEBUG_DELAY_MS = 0;

  useEffect(() => {
    if (!invitationId) {
      return;
    }

    async function loadData() {
      try {
        const data = await loadInvitation(invitationId);
        if (!data) {
          setInvitation(null);
          setLoading(false);
          return;
        }

        const savedResponse = await loadResponse(invitationId);
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
  }, [invitationId]);

  const handleRsvpSubmit = async (responses) => {
    await saveResponse(invitationId, responses);
    setInvitation((prev) => ({ ...prev, has_responded: true, response: responses }));
  };

  return (
    <div className="app-shell">
      <div className="app-content">
        <Routes>
          <Route path="/admin" element={<AdminPortal />} />

          {!invitationId && !loading && (
            <Route
              path="*"
              element={
                <div className="page page-center confirmation-page single-page-shell">
                  <div className="card confirmation-card status-card">
                    <span className="landing-accommodation-corner landing-accommodation-corner-tl" aria-hidden="true" />
                    <span className="landing-accommodation-corner landing-accommodation-corner-br" aria-hidden="true" />

                    <h1>Invalid Link</h1>
                    <p>Please check your invite QR code and try again (or reach out to Mark &lt;3).</p>
                  </div>
                </div>
              }
            />
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