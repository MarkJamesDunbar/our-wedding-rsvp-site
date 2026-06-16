import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RSVPForm from './pages/RSVPForm';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminPortal from './pages/AdminPortal';
import { courses } from './data/menuOptions';
import { apiPath } from './config/api';
import localInvitations from './data/invitations.json';

const RESPONSE_STORAGE_PREFIX = 'rsvp-response:';

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
        setLoading(false);
      }
    }

    loadData();
  }, [invitationId]);

  const handleRsvpSubmit = async (responses) => {
    await saveResponse(invitationId, responses);
    
    setInvitation(prev => ({ ...prev, has_responded: true, response: responses }));
  };

  return (
    <div className="app-shell">
      <div className="app-content">
        <Routes>
          <Route path="/admin" element={<AdminPortal />} />
          
          {!invitationId && !loading && (
            <Route path="*" element={
              <div className="page page-center confirmation-page">
                <div className="card confirmation-card status-card">
                  <h1>Invalid Invite Link</h1>
                  <p>Please check your invite and try again (or reach out to Mark &lt;3).</p>
                </div>
              </div>
            } />
          )}
          
          {invitation && (
            <>
              <Route path="/" element={<HomePage invitation={invitation} />} />
              <Route path="/invite" element={<HomePage invitation={invitation} />} />
              <Route path="/rsvp" element={<RSVPForm invitation={invitation} courses={courses} onSubmit={handleRsvpSubmit} />} />
              <Route path="/invite/rsvp" element={<RSVPForm invitation={invitation} courses={courses} onSubmit={handleRsvpSubmit} />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/invite/confirmation" element={<ConfirmationPage />} />
            </>
          )}
          
          {loading && (
            <Route
              path="*"
              element={
                <div className="page page-center">
                  <div className="card status-card">
                    <p className="eyebrow">Loading</p>
                    <h1>Getting your invitation</h1>
                    <p>Just a moment while we fetch your details.</p>
                  </div>
                </div>
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
      <AppContent />
    </BrowserRouter>
  );
}