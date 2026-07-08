import { useState, useEffect } from 'react';
import { apiPath } from '../config/api';

export default function AdminPortal() {
  const [responses, setResponses] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  function fetchAllResponses() {
    setLoading(true);
    fetch(apiPath('/api/admin/all-responses'))
      .then((res) => res.json())
      .then((data) => {
        setResponses(data.responses || []);
        setLastUpdated(new Date().toLocaleString());
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetch(apiPath('/api/admin/all-responses'))
      .then((res) => res.json())
      .then((data) => {
        setResponses(data.responses || []);
        setLastUpdated(new Date().toLocaleString());
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const downloadCSV = () => {
    window.location.href = apiPath('/api/admin/export-csv');
  };

  if (loading) {
    return (
      <div className="page page-center single-page-shell">
        <div className="card status-card">
          <p className="eyebrow">Admin</p>
          <h1>Loading responses</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="admin-header">
        <p className="eyebrow">Admin portal</p>
        <h1>Guest responses</h1>
      </div>

      <div className="button-row">
        <button onClick={fetchAllResponses} className="btn-ghost" title="Refresh">
          Refresh
        </button>

        <button onClick={downloadCSV} className="btn-sage">
          Download CSV
        </button>
      </div>

      {lastUpdated && <div className="caption">Last refreshed: {lastUpdated}</div>}

      <div className="table-wrap card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Invitation</th>
              <th>Guest Name</th>
              <th>Attending</th>
              <th>Course 1</th>
              <th>Course 2</th>
              <th>Course 3</th>
              <th>Dietary</th>
            </tr>
          </thead>
          <tbody>
            {responses.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  No guests
                </td>
              </tr>
            ) : (
              responses.map((resp, idx) => {
                let rowClass = '';
                if (resp.attended === 'Yes') rowClass = 'row-attending';
                else if (resp.attended === 'Not yet responded') rowClass = 'row-pending';

                return (
                  <tr key={idx} className={rowClass}>
                    <td>{resp.invitation_id}</td>
                    <td>{resp.name}</td>
                    <td>
                      <div className="attending-mark">
                        {resp.attended === 'Yes'
                          ? 'Yes'
                          : resp.attended === 'No'
                            ? 'No'
                            : 'Pending'}
                      </div>
                      <div className="caption">{resp.last_updated}</div>
                    </td>
                    <td>{resp.course_1}</td>
                    <td>{resp.course_2}</td>
                    <td>{resp.course_3}</td>
                    <td>{resp.dietary}</td>
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
