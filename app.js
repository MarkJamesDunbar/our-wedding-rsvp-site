const coupleEmail = "rsvp@example.com";
const form = document.querySelector("#rsvp-form");
const preview = document.querySelector("#rsvp-preview");
const status = document.querySelector("#form-status");
const inviteLink = document.querySelector("#invite-link");
const copyLinkButton = document.querySelector("#copy-link");
const copyRsvpButton = document.querySelector("#copy-rsvp");
const guestNameInput = document.querySelector("#guest-name");
const guestEmailInput = document.querySelector("#guest-email");
const attendanceInput = document.querySelector("#attendance");
const guestCountInput = document.querySelector("#guest-count");
const dietaryNotesInput = document.querySelector("#dietary-notes");
const guestMessageInput = document.querySelector("#guest-message");
const storageKey = "wedding-rsvp-draft";

const cleanText = (value, maxLength) =>
  value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);

const normaliseCount = (value) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return 1;
  }

  return Math.min(6, Math.max(1, parsed));
};

const buildRsvpText = () => {
  const guestName = cleanText(guestNameInput.value, 80);
  const guestEmail = cleanText(guestEmailInput.value, 120);
  const attendance = cleanText(attendanceInput.value, 40);
  const guestCount = normaliseCount(guestCountInput.value);
  const dietaryNotes = cleanText(dietaryNotesInput.value, 300) || "None";
  const guestMessage = cleanText(guestMessageInput.value, 400) || "None";
  const invitee = cleanText(new URLSearchParams(window.location.search).get("invite") || "", 80);

  return [
    "Wedding RSVP",
    invitee ? `Invitation: ${invitee}` : null,
    `Name: ${guestName}`,
    `Email: ${guestEmail}`,
    `Attendance: ${attendance}`,
    `Party size: ${guestCount}`,
    `Dietary requirements: ${dietaryNotes}`,
    `Message: ${guestMessage}`,
  ]
    .filter(Boolean)
    .join("\n");
};

const updatePreview = () => {
  preview.textContent = buildRsvpText();
};

const setStatus = (message) => {
  status.textContent = message;
};

const saveDraft = () => {
  const payload = {
    guestName: cleanText(guestNameInput.value, 80),
    guestEmail: cleanText(guestEmailInput.value, 120),
    attendance: attendanceInput.value,
    guestCount: normaliseCount(guestCountInput.value),
    dietaryNotes: cleanText(dietaryNotesInput.value, 300),
    guestMessage: cleanText(guestMessageInput.value, 400),
  };

  window.localStorage.setItem(storageKey, JSON.stringify(payload));
};

const restoreDraft = () => {
  const invitee = cleanText(new URLSearchParams(window.location.search).get("invite") || "", 80);
  const savedValue = window.localStorage.getItem(storageKey);

  if (invitee && !guestNameInput.value) {
    guestNameInput.value = invitee;
  }

  if (!savedValue) {
    updatePreview();
    return;
  }

  try {
    const saved = JSON.parse(savedValue);
    guestNameInput.value = guestNameInput.value || cleanText(saved.guestName || "", 80);
    guestEmailInput.value = cleanText(saved.guestEmail || "", 120);
    attendanceInput.value = cleanText(saved.attendance || "", 40);
    guestCountInput.value = String(normaliseCount(saved.guestCount));
    dietaryNotesInput.value = cleanText(saved.dietaryNotes || "", 300);
    guestMessageInput.value = cleanText(saved.guestMessage || "", 400);
  } catch {
    window.localStorage.removeItem(storageKey);
  }

  updatePreview();
};

const validateForm = () => {
  const guestName = cleanText(guestNameInput.value, 80);
  const guestEmail = cleanText(guestEmailInput.value, 120);
  const attendance = cleanText(attendanceInput.value, 40);

  if (!guestName || !guestEmail || !attendance) {
    setStatus("Please complete your name, email address, and attendance choice.");
    return false;
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(guestEmail)) {
    setStatus("Please enter a valid email address.");
    return false;
  }

  guestCountInput.value = String(normaliseCount(guestCountInput.value));
  return true;
};

const copyText = async (value, successMessage) => {
  try {
    await navigator.clipboard.writeText(value);
    setStatus(successMessage);
  } catch {
    setStatus("Copy failed. Please select the text and copy it manually.");
  }
};

const buildShareUrl = () => {
  const url = new URL(window.location.href);
  url.hash = "";
  return url.toString();
};

inviteLink.value = buildShareUrl();

form.addEventListener("input", () => {
  saveDraft();
  updatePreview();
  setStatus("");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  saveDraft();
  updatePreview();
  const body = encodeURIComponent(buildRsvpText());
  const subject = encodeURIComponent("Wedding RSVP");
  window.location.href = `mailto:${encodeURIComponent(coupleEmail)}?subject=${subject}&body=${body}`;
  setStatus("RSVP email prepared. Please send it from your email app.");
});

copyLinkButton.addEventListener("click", () => {
  copyText(inviteLink.value, "Invitation link copied.");
});

copyRsvpButton.addEventListener("click", () => {
  if (!validateForm()) {
    return;
  }

  updatePreview();
  copyText(buildRsvpText(), "RSVP details copied.");
});

restoreDraft();
