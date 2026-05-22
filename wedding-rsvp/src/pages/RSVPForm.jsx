import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RSVPForm({ invitation, courses, onSubmit }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('attendance');
  const [error, setError] = useState(null);
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
  };

  // Page 1: Attendance
  if (step === 'attendance') {
    return (
      <div>
        <h1>Can you attend?</h1>
        
        {responses.map((response, idx) => (
          <div key={idx} style={{ marginBottom: '25px', padding: '15px', border: '1px solid #ddd' }}>
            <h3>{response.name}</h3>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleAttendingChange(idx, true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: response.attending === true ? '#4caf50' : '#f0f0f0',
                  color: response.attending === true ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ✓ Can attend
              </button>
              
              <button
                onClick={() => handleAttendingChange(idx, false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: response.attending === false ? '#f44336' : '#f0f0f0',
                  color: response.attending === false ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ✗ Cannot attend
              </button>
            </div>
          </div>
        ))}

        <button onClick={() => setStep('menu')}>Next</button>
      </div>
    );
  }

  // Page 2: Menu selection (only for attending guests)
  const attendingGuests = responses.filter(r => r.attending === true);

  if (attendingGuests.length === 0) {
    return (
      <div>
        <h1>Thanks for letting us know!</h1>
        <button onClick={() => {
          onSubmit(responses);
          navigate(`/invite/confirmation?id=${invitation.qr_code}`);
        }}>
          Submit
        </button>
      </div>
    );
  }

  const handleCourseChange = (guestName, courseId, value) => {
    const updated = [...responses];
    const guestIdx = updated.findIndex(r => r.name === guestName);
    updated[guestIdx].courses[courseId] = value;
    setResponses(updated);
  };

  const handleDietaryChange = (guestName, value) => {
    const updated = [...responses];
    const guestIdx = updated.findIndex(r => r.name === guestName);
    updated[guestIdx].dietary = value;
    setResponses(updated);
  };

  const handleSubmit = () => {
    // Validate all attending guests have all courses selected
    const isValid = attendingGuests.every(guest => 
      guest.courses.course_1 && guest.courses.course_2 && guest.courses.course_3
    );

    if (!isValid) {
      setError('*You must choose an option for each course');
      return;
    }

    onSubmit(responses);
    navigate(`/invite/confirmation?id=${invitation.qr_code}`);
  };

  return (
    <div>
      <h1>Menu selections</h1>
      
      {error && (
        <div style={{ color: '#f44336', marginBottom: '20px', fontWeight: 'bold' }}>
          {error}
        </div>
      )}
      
      {attendingGuests.map((guest) => (
        <div key={guest.name} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '20px' }}>
          <h2>{guest.name}</h2>
          
          {courses.map(course => (
            <div key={course.id} style={{ marginBottom: '15px' }}>
              <label>{course.label}:</label>
              <select 
                value={guest.courses[course.id] || ''}
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

          <div>
            <label>Dietary restrictions:</label>
            <textarea 
              placeholder="Any dietary needs?" 
              value={guest.dietary}
              onChange={(e) => handleDietaryChange(guest.name, e.target.value)}
              style={{ width: '100%', minHeight: '80px' }}
            />
          </div>
        </div>
      ))}

      <button onClick={() => setStep('attendance')}>Back</button>
      <button onClick={handleSubmit} style={{ marginLeft: '10px' }}>
        Submit
      </button>
    </div>
  );
}