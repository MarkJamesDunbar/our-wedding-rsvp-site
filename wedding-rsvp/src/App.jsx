import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RSVPForm from './pages/RSVPForm';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminPortal from './pages/AdminPortal';
import { courses } from './data/menuOptions';
import { apiPath } from './config/api';

function AppContent() {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('id');
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(Boolean(invitationId));

  useEffect(() => {
    if (!invitationId) {
      return;
    }

    fetch(apiPath(`/api/invitation/${invitationId}`))
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setInvitation(data);
        return fetch(apiPath(`/api/get-response/${invitationId}`));
      })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setInvitation(prev => ({ ...prev, has_responded: true, response: data.data }));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setInvitation(null);
        setLoading(false);
      });
  }, [invitationId]);

  const handleRsvpSubmit = async (responses) => {
    await fetch(apiPath('/api/save-response'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitation_id: invitationId, response_data: responses })
    });
    
    setInvitation(prev => ({ ...prev, has_responded: true, response: responses }));
  };

  return (
    <Routes>
      <Route path="/admin" element={<AdminPortal />} />
      
      {!invitationId && !loading && (
        <Route path="*" element={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Invalid invitation link</h1>
            <p>Please check your invite and try again</p>
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
      
      {loading && <Route path="*" element={<div>Loading...</div>} />}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}