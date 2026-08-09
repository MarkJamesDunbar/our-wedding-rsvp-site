import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const [, , csvPath, ...outputPaths] = process.argv;

if (!csvPath || outputPaths.length === 0) {
  console.error('Usage: node scripts/sync-invitations-from-csv.mjs <csv-path> <output-json> [more-output-json...]');
  process.exit(1);
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const [headerLine, ...dataLines] = lines;
  const headers = headerLine.split(',');

  return dataLines.map((line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];

      if (char === '"') {
        if (inQuotes && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);

    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

function toBool(value) {
  return String(value || '').trim().toUpperCase() === 'Y';
}

function makeDisplayName(firstName, secondName) {
  return [firstName, secondName].map((part) => part.trim()).filter(Boolean).join(' ');
}

function makePublicToken(inviteId, guestNames, usedTokens) {
  let salt = 0;

  while (true) {
    const token = crypto
      .createHash('sha256')
      .update(`${inviteId}|${guestNames.join('|')}|${salt}`)
      .digest('base64url')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 8)
      .toLowerCase();

    if (!usedTokens.has(token)) {
      usedTokens.add(token);
      return token;
    }

    salt += 1;
  }
}

const csvText = fs.readFileSync(csvPath, 'utf8');
const rows = parseCsv(csvText);
const invitationsById = new Map();

for (const row of rows) {
  const inviteId = String(row.invite_id).trim();
  const qrCode = `INV-${inviteId.padStart(3, '0')}`;
  const firstName = String(row.guest_first_name || '').trim();
  const secondName = String(row.guest_second_name || '').trim();
  const guestName = makeDisplayName(firstName, secondName);

  if (!guestName) {
    continue;
  }

  if (!invitationsById.has(inviteId)) {
    invitationsById.set(inviteId, {
      qr_code: qrCode,
      invite_id: inviteId,
      primary_guest: guestName,
      party_size: 0,
      guests: [],
      has_responded: false,
      response: null
    });
  }

  const invitation = invitationsById.get(inviteId);
  invitation.guests.push({
    id: `${qrCode}-guest-${String(invitation.guests.length + 1).padStart(2, '0')}`,
    name: guestName,
    first_name: firstName,
    second_name: secondName,
    is_named: true,
    is_child: toBool(row.is_child),
    is_infant: toBool(row.is_infant)
  });
  invitation.party_size = invitation.guests.length;
}

const usedTokens = new Set();

for (const invitation of invitationsById.values()) {
  invitation.public_token = makePublicToken(
    invitation.invite_id,
    invitation.guests.map((guest) => guest.name),
    usedTokens
  );
}

const sortedEntries = [...invitationsById.entries()].sort((left, right) => Number(left[0]) - Number(right[0]));
const output = Object.fromEntries(sortedEntries.map(([, invitation]) => [invitation.qr_code, invitation]));
const jsonText = `${JSON.stringify(output, null, 2)}\n`;

for (const outputPath of outputPaths) {
  const resolvedPath = path.resolve(outputPath);
  fs.writeFileSync(resolvedPath, jsonText, 'utf8');
  console.log(`Wrote ${resolvedPath}`);
}

console.log(`Generated ${sortedEntries.length} invitations from ${rows.length} CSV rows.`);
