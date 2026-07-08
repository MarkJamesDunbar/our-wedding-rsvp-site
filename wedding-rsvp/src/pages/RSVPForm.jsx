import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { menuDetails } from '../data/menuOptions';

function getGuestKey(guest, index) {
  return guest.id || guest.name || `guest-${index}`;
}

function getGuestDisplayName(guest) {
  if (guest.name) {
    return guest.name;
  }

  return [guest.first_name, guest.second_name].filter(Boolean).join(' ');
}

function getOptionId(guestKey, courseId, optionIndex) {
  return `${guestKey}-${courseId}-${optionIndex}`.replace(/\s+/g, '-').toLowerCase();
}

function createInitialResponses(invitation) {
  const savedResponses = Array.isArray(invitation.response) ? invitation.response : [];

  return invitation.guests.map((guest, index) => {
    const guestKey = getGuestKey(guest, index);
    const guestName = getGuestDisplayName(guest);
    const savedResponse = savedResponses.find(
      (response) => response.guestId === guestKey || response.name === guestName
    );

    return {
      guestId: guestKey,
      name: guestName,
      firstName: guest.first_name || '',
      secondName: guest.second_name || '',
      isChild: Boolean(guest.is_child),
      isInfant: Boolean(guest.is_infant),
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

  useEffect(() => {
    const RSVP_INSET_COLOR = '#571216';
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

    document.documentElement.style.backgroundColor = RSVP_INSET_COLOR;
    document.body.style.backgroundColor = RSVP_INSET_COLOR;
    if (rootNode) {
      rootNode.style.backgroundColor = RSVP_INSET_COLOR;
    }
    if (appShellNode instanceof HTMLElement) {
      appShellNode.style.backgroundColor = RSVP_INSET_COLOR;
    }
    themeMeta?.setAttribute('content', RSVP_INSET_COLOR);

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
    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [step]);

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
        <h1>
          <span className="rsvp-title-line">RSVP</span>
          <span className="rsvp-title-line">Confirmation</span>
        </h1>
        
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
  const attendingGuests = responses.filter((response) => response.attending === true);
  const adultGuests = attendingGuests.filter((guest) => !guest.isChild && !guest.isInfant);

  const handleCourseChange = (guestId, courseId, value) => {
    const updated = [...responses];
    const guestIdx = updated.findIndex((response) => response.guestId === guestId);
    updated[guestIdx].courses[courseId] = value;
    setResponses(updated);
    setInvalidCourseFields((current) => {
      const next = { ...current };
      delete next[`${guestId}:${courseId}`];
      return next;
    });
  };

  const handleDietaryChange = (guestId, value) => {
    const updated = [...responses];
    const guestIdx = updated.findIndex((response) => response.guestId === guestId);
    updated[guestIdx].dietary = value;
    setResponses(updated);
  };

  const handleSubmit = async () => {
    const missingFields = {};

    adultGuests.forEach((guest) => {
      courses.forEach((course) => {
        if (!guest.courses[course.id]) {
          missingFields[`${guest.guestId}:${course.id}`] = true;
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
              <div key={guest.guestId} className="card guest-card menu-preview-card menu-guest-card">
          <span className="landing-accommodation-corner landing-accommodation-corner-tl" aria-hidden="true" />
          <span className="landing-accommodation-corner landing-accommodation-corner-br" aria-hidden="true" />
          <div className="menu-preview-intro menu-guest-intro">
            <h2 className="menu-guest-name">{guest.name}</h2>
                  <p className="menu-guest-subtitle">
                    {guest.isInfant ? 'Baby Requests' : guest.isChild ? menuDetails.childrensMenu.label : 'Your Menu'}
                  </p>
                  {!guest.isChild && !guest.isInfant && (
                    <p className="menu-guest-meta">{menuDetails.intro} {menuDetails.legend}</p>
                  )}
          </div>

                {!guest.isChild && !guest.isInfant && menuDetails.sections.map((section) => {
                  const items = section.type === 'choice' ? section.options : section.items;
                  const fieldKey = `${guest.guestId}:${section.id}`;
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
                            const optionId = getOptionId(guest.guestId, section.id, index);
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
                                  name={`${guest.guestId}-${section.id}`}
                                  className="menu-choice-input"
                                  checked={isSelected}
                                  onChange={() => {
                                    handleCourseChange(guest.guestId, section.id, item.value);
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

                {guest.isChild && (
                  <div className="menu-section">
                    <h3>{menuDetails.childrensMenu.label}</h3>
                    <p className="menu-children-copy">{menuDetails.childrensMenu.items.join(' · ')}</p>
                  </div>
                )}

                {guest.isInfant && (
                  <div className="menu-section menu-dietary-section">
                    <p className="menu-dietary-note">
                      We are happy to help provide for your baby. Please let us know if you need
                      anything such as a highchair, space for a pram, or somewhere to warm a
                      bottle.
                    </p>
                    <div className="form-field menu-dietary-field">
                      <textarea
                        id={`dietary-${guest.guestId}`}
                        placeholder="Please let us know if you need anything for your baby."
                        value={guest.dietary}
                        onChange={(e) => handleDietaryChange(guest.guestId, e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {!guest.isInfant && (
                  <div className="menu-section menu-dietary-section">
                    <h3>Dietary Requirements</h3>
                    <p className="menu-dietary-note">Please include dietary requirements here.</p>
                    <div className="form-field menu-dietary-field">
                      <textarea
                        id={`dietary-${guest.guestId}`}
                        placeholder="(e.g., vegan, gluten-free, allergies)"
                        value={guest.dietary}
                        onChange={(e) => handleDietaryChange(guest.guestId, e.target.value)}
                      />
                    </div>
                  </div>
                )}
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