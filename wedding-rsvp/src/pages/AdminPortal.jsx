import { useState, useEffect } from 'react';
import { apiPath } from '../config/api';

export default function AdminPortal() {
  const [responses, setResponses] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  function fetchAllResponses() {
    setLoading(true);
    fetch(apiPath('/api/admin/all-responses'))
      .then(res => res.json())
      .then(data => {
        setResponses(data.responses || []);
        setLastUpdated(new Date().toLocaleString());
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetch(apiPath('/api/admin/all-responses'))
      .then(res => res.json())
      .then(data => {
        setResponses(data.responses || []);
        setLastUpdated(new Date().toLocaleString());
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const downloadCSV = () => {
    window.location.href = apiPath('/api/admin/export-csv');
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={fetchAllResponses}
          style={{ padding: '8px 12px', fontSize: '16px', cursor: 'pointer', border: '1px solid #ddd', backgroundColor: 'white', borderRadius: '4px' }}
          title="Refresh"
        >
          🔄
        </button>

        <button
          onClick={downloadCSV}
          style={{ padding: '8px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Download CSV
        </button>
      </div>

      {lastUpdated && (
        <div style={{ marginBottom: '12px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
          Last refreshed: {lastUpdated}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '13px',
          minWidth: '900px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left', minWidth: '80px' }}>Invitation</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left', minWidth: '120px' }}>Guest Name</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', minWidth: '100px' }}>Attending</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', minWidth: '100px' }}>Course 1</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', minWidth: '100px' }}>Course 2</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', minWidth: '100px' }}>Course 3</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', minWidth: '120px' }}>Dietary</th>
            </tr>
          </thead>
          <tbody>
            {responses.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ border: '1px solid #ddd', padding: '20px', textAlign: 'center' }}>
                  No guests
                </td>
              </tr>
            ) : (
              responses.map((resp, idx) => {
                let rowColor = 'white';
                if (resp.attended === 'Yes') rowColor = '#d4edda';
                else if (resp.attended === 'Not yet responded') rowColor = '#e9ecef';
                
                return (
                  <tr key={idx} style={{ backgroundColor: rowColor }}>
                    <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: '12px' }}>{resp.invitation_id}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{resp.name}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {resp.attended === 'Yes' ? '✓' : resp.attended === 'No' ? '✗' : '—'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {resp.last_updated}
                      </div>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                      {resp.course_1}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                      {resp.course_2}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                      {resp.course_3}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                      {resp.dietary}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}