import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RSVPForm({ invitation, courses, onSubmit }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('attendance');
  const [error, setError] = useState(null);
  const [attendanceError, setAttendanceError] = useState(null);
  const [invalidCourseFields, setInvalidCourseFields] = useState({});
  const [responses, setResponses] = useState(
    invitation.guests.map(guest => ({
      name: guest.name,
      attending: null,
      courses: {},
      dietary: ''
    }))
  );

  const handleAttendingChange = (index, attending) => {
    const updated = [...responses];
    updated[index].attending = attending;
    setResponses(updated);
    setAttendanceError(null);
  };

  const allAttendanceChosen = responses.every((response) => response.attending !== null);

  const handleAttendanceNext = () => {
    if (!allAttendanceChosen) {
      setAttendanceError('Please confirm each guest\'s attendance before continuing.');
      return;
    }

    const hasAttendingGuest = responses.some((response) => response.attending === true);

    if (!hasAttendingGuest) {
      onSubmit(responses);
      navigate(`/invite/confirmation?id=${invitation.qr_code}`);
      return;
    }

    setStep('menu');
  };

  // Page 1: Attendance
  if (step === 'attendance') {
    return (
      <div className="page rsvp-page rsvp-attendance-page">
        <h1>RSVP</h1>
        
        {responses.map((response, idx) => (
          <div key={idx} className="card guest-card">
            <h3>{response.name}</h3>
            
            <div className="button-row">
              <button
                onClick={() => handleAttendingChange(idx, true)}
                aria-pressed={response.attending === true}
                className={`can-attend ${response.attending === true ? 'btn-success' : 'btn-ghost'}`}
              >
                Delightfully Accept
              </button>
              
              <button
                onClick={() => handleAttendingChange(idx, false)}
                aria-pressed={response.attending === false}
                className={`cannot-attend ${response.attending === false ? 'btn-danger' : 'btn-ghost'}`}
              >
                Regretfully Decline
              </button>
            </div>
          </div>
        ))}

        {attendanceError && (
          <div className="error-banner">{attendanceError}</div>
        )}

        <div className="button-row button-row-right">
          <button className="next-button" onClick={handleAttendanceNext}>Next</button>
        </div>
      </div>
    );
  }

  // Page 2: Menu selection (only for attending guests)
  const attendingGuests = responses.filter(r => r.attending === true);

  const handleCourseChange = (guestName, courseId, value) => {
    const updated = [...responses];
    const guestIdx = updated.findIndex(r => r.name === guestName);
    updated[guestIdx].courses[courseId] = value;
    setResponses(updated);
    setInvalidCourseFields((current) => {
      const next = { ...current };
      delete next[`${guestName}:${courseId}`];
      return next;
    });
  };

  const handleDietaryChange = (guestName, value) => {
    const updated = [...responses];
    const guestIdx = updated.findIndex(r => r.name === guestName);
    updated[guestIdx].dietary = value;
    setResponses(updated);
  };

  const handleSubmit = () => {
    const missingFields = {};

    attendingGuests.forEach((guest) => {
      courses.forEach((course) => {
        if (!guest.courses[course.id]) {
          missingFields[`${guest.name}:${course.id}`] = true;
        }
      });
    });

    const isValid = Object.keys(missingFields).length === 0;

    if (!isValid) {
      setInvalidCourseFields(missingFields);
      setError('Please choose an option for each course.');
      return;
    }

    setInvalidCourseFields({});
    onSubmit(responses);
    navigate(`/invite/confirmation?id=${invitation.qr_code}`);
  };

  return (
    <div className="page rsvp-page rsvp-menu-page">
      <h1>Menu Selections</h1>
      
      {attendingGuests.map((guest) => (
        <div key={guest.name} className="card guest-card">
          <h2 className="guest-name">{guest.name}</h2>
          
          {courses.map(course => (
            <div key={course.id} className="form-field">
              <label>{course.label}</label>
              <select 
                className={invalidCourseFields[`${guest.name}:${course.id}`] ? 'field-error' : ''}
                value={guest.courses[course.id] || ''}
                aria-invalid={invalidCourseFields[`${guest.name}:${course.id}`] ? 'true' : 'false'}
                onChange={(e) => {
                  handleCourseChange(guest.name, course.id, e.target.value);
                  setError(null);
                }}
              >
                <option value="">Select...</option>
                {course.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}

          <div className="form-field">
            <label>Dietary restrictions</label>
            <textarea 
              placeholder="Any dietary needs?" 
              value={guest.dietary}
              onChange={(e) => handleDietaryChange(guest.name, e.target.value)}
            />
          </div>
        </div>
      ))}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="button-row button-row-right">
        <button className="next-button" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}