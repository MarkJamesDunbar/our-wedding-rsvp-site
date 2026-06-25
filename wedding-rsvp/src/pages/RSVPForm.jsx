import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { menuDetails } from '../data/menuOptions';

function getOptionId(guestName, courseId, optionIndex) {
  return `${guestName}-${courseId}-${optionIndex}`.replace(/\s+/g, '-').toLowerCase();
}

function createInitialResponses(invitation) {
  const savedResponses = Array.isArray(invitation.response) ? invitation.response : [];

  return invitation.guests.map((guest) => {
    const savedResponse = savedResponses.find((response) => response.name === guest.name);

    return {
      name: guest.name,
      attending: savedResponse?.attending ?? null,
      courses: savedResponse?.courses ?? {},
      dietary: savedResponse?.dietary ?? ''
    };
  });
}

export default function RSVPForm({ invitation, courses, onSubmit }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [attendanceError, setAttendanceError] = useState(null);
  const [invalidCourseFields, setInvalidCourseFields] = useState({});
  const [responses, setResponses] = useState(() => createInitialResponses(invitation));
  const step = searchParams.get('step') === 'menu' ? 'menu' : 'attendance';
  const rsvpPath = `/invite/rsvp?id=${invitation.qr_code}`;

  // If the menu step is opened with no attending guests (e.g. a direct reload
  // resets the in-progress selections), send them back to the attendance step.
  useEffect(() => {
    const hasAttending = responses.some((response) => response.attending === true);
    if (step === 'menu' && !hasAttending) {
      navigate(rsvpPath, { replace: true });
    }
  }, [step, responses, navigate, rsvpPath]);

  const handleAttendingChange = (index, attending) => {
    const updated = [...responses];
    updated[index].attending = attending;
    setResponses(updated);
    setAttendanceError(null);
  };

  const allAttendanceChosen = responses.every((response) => response.attending !== null);

  const handleAttendanceNext = async () => {
    if (!allAttendanceChosen) {
      setAttendanceError('Please confirm each guest\'s attendance before continuing.');
      return;
    }

    const hasAttendingGuest = responses.some((response) => response.attending === true);

    if (!hasAttendingGuest) {
      await onSubmit(responses);
      navigate(`/invite/confirmation?id=${invitation.qr_code}&attending=none`);
      return;
    }

    navigate(`${rsvpPath}&step=menu`);
  };

  // Page 1: Attendance
  if (step === 'attendance') {
    return (
      <div className="page rsvp-page rsvp-attendance-page">
        <h1>RSVP</h1>
        
        {responses.map((response, idx) => (
          <div key={idx} className="card guest-card">
            <span className="landing-accommodation-corner landing-accommodation-corner-tl" aria-hidden="true" />
            <span className="landing-accommodation-corner landing-accommodation-corner-br" aria-hidden="true" />
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

  const handleSubmit = async () => {
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
    await onSubmit(responses);
    navigate(`/invite/confirmation?id=${invitation.qr_code}&attending=some`);
  };

  return (
    <div className="page rsvp-page rsvp-menu-page">
      <h1>Menu Choices</h1>
      
      {attendingGuests.map((guest) => (
        <div key={guest.name} className="card guest-card menu-preview-card menu-guest-card">
          <span className="landing-accommodation-corner landing-accommodation-corner-tl" aria-hidden="true" />
          <span className="landing-accommodation-corner landing-accommodation-corner-br" aria-hidden="true" />
          <div className="menu-preview-intro menu-guest-intro">
            <h2 className="menu-guest-name">{guest.name}</h2>
            <p className="menu-guest-subtitle">Your Choices</p>
            <p className="menu-guest-meta">{menuDetails.intro} {menuDetails.legend}</p>
          </div>

          {menuDetails.sections.map((section) => {
            const items = section.type === 'choice' ? section.options : section.items;
            const fieldKey = `${guest.name}:${section.id}`;
            const isInvalid = section.type === 'choice' && Boolean(invalidCourseFields[fieldKey]);

            return (
              <div
                key={section.id}
                className={`menu-section${isInvalid ? ' menu-course-field-error' : ''}`}
              >
                <h3>{section.label}</h3>

                {section.type === 'choice' ? (
                  <div className="menu-choice-list" role="radiogroup" aria-label={`${guest.name} ${section.label}`}>
                    {items.map((item, index) => {
                      const optionId = getOptionId(guest.name, section.id, index);
                      const isSelected = guest.courses[section.id] === item.value;

                      return (
                        <label
                          key={item.value}
                          htmlFor={optionId}
                          className={`menu-choice-option${isSelected ? ' is-selected' : ''}`}
                        >
                          <input
                            id={optionId}
                            type="radio"
                            name={`${guest.name}-${section.id}`}
                            className="menu-choice-input"
                            checked={isSelected}
                            onChange={() => {
                              handleCourseChange(guest.name, section.id, item.value);
                              setError(null);
                            }}
                          />
                          <span className="menu-choice-control" aria-hidden="true" />
                          <span className="menu-choice-copy">
                            <span className="menu-choice-title">
                              <span className="menu-choice-prefix">{`Choice ${index + 1}`}</span>
                              <span className="menu-choice-text">{` - ${item.value}`}</span>
                            </span>
                            {(item.dietary || item.allergens) && (
                              <span className="menu-choice-note">
                                {item.dietary && <span>{`(${item.dietary})`}</span>}
                                {item.allergens && <span>{`(${item.allergens})`}</span>}
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <ul className="menu-section-list">
                    {items.map((item) => (
                      <li key={item.value} className="menu-section-item">
                        <p className="menu-item-name">{item.value}</p>
                        {item.allergens && <p className="menu-item-note">({item.allergens})</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          <div className="menu-section">
            <h3>{menuDetails.childrensMenu.label}</h3>
            <p className="menu-children-copy">{menuDetails.childrensMenu.items.join(' · ')}</p>
          </div>

          <div className="menu-section menu-dietary-section">
            <h3>Dietary Requirements</h3>
            <p className="menu-dietary-note">Please also include any vegan requirements here.</p>
            <div className="form-field menu-dietary-field">
              <textarea
                id={`dietary-${guest.name}`}
                placeholder="Any dietary needs or allergies we should know about?"
                value={guest.dietary}
                onChange={(e) => handleDietaryChange(guest.name, e.target.value)}
              />
            </div>
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