const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is required but was not set.');
  process.exit(1);
}

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : null;

app.use(cors(corsOrigins ? { origin: corsOrigins } : undefined));
app.use(express.json());

console.log('Server starting...');
console.log('DATABASE_URL:', connectionString ? 'set' : 'not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

const useSsl =
  process.env.DATABASE_SSL === 'true' ||
  process.env.PGSSLMODE === 'require';

const pool = new Pool({
  connectionString,
  ssl: useSsl
    ? {
        rejectUnauthorized: false
      }
    : undefined
});

pool.on('error', (error) => {
  console.error('PostgreSQL pool error:', error.message);
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

function parseJsonField(value, fallback) {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function escapeCsv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

async function resolveInvitationKey(invitationKey) {
  const result = await pool.query(
    `
      SELECT id
      FROM invitations
      WHERE id = $1 OR public_token = $1
      LIMIT 1
    `,
    [invitationKey]
  );

  return result.rows[0]?.id || null;
}

// Inserts new invitations and updates existing invitation details.
// This does not update or delete anything in the responses table.
async function seedInvitations() {
  console.log('Synchronising invitations from invitations.json...');

  const invitationsPath = path.join(__dirname, 'invitations.json');
  console.log('Reading:', invitationsPath);

  if (!fs.existsSync(invitationsPath)) {
    console.warn('invitations.json was not found. Skipping invitation sync.');
    return;
  }

  const fileText = fs.readFileSync(invitationsPath, 'utf8');
  const invitations = JSON.parse(fileText);
  const entries = Object.values(invitations);

  console.log(`Found ${entries.length} invitations in invitations.json`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const invitation of entries) {
    if (!invitation.qr_code) {
      console.warn('Skipping invitation with no qr_code:', invitation);
      skipped += 1;
      continue;
    }

    const result = await pool.query(
      `
        INSERT INTO invitations (
          id,
          public_token,
          invite_id,
          primary_guest,
          party_size,
          guests
        )
        VALUES ($1, $2, $3, $4, $5, $6)

        ON CONFLICT (id) DO UPDATE SET
          public_token = EXCLUDED.public_token,
          invite_id = EXCLUDED.invite_id,
          primary_guest = EXCLUDED.primary_guest,
          party_size = EXCLUDED.party_size,
          guests = EXCLUDED.guests

        RETURNING (xmax = 0) AS inserted
      `,
      [
        invitation.qr_code,
        invitation.public_token || null,
        invitation.invite_id,
        invitation.primary_guest,
        invitation.party_size,
        JSON.stringify(invitation.guests || [])
      ]
    );

    if (result.rows[0]?.inserted) {
      inserted += 1;
    } else {
      updated += 1;
    }
  }

  console.log('Invitation synchronisation complete');
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log('Existing RSVP and menu responses were not modified.');
}

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id TEXT PRIMARY KEY,
        public_token TEXT,
        invite_id TEXT,
        primary_guest TEXT,
        party_size INTEGER,
        guests TEXT
      )
    `);

    await pool.query(`ALTER TABLE invitations ADD COLUMN IF NOT EXISTS public_token TEXT`);
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS invitations_public_token_idx ON invitations (public_token)`);

    console.log('Invitations table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        invitation_id TEXT UNIQUE,
        response_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Responses table ready');

    await pool.query('SELECT NOW()');
    console.log('Database connection working');

    await seedInvitations();
  } catch (error) {
    console.error('Database initialisation failed:', error.message);
    throw error;
  }
}

app.get('/healthz', (_req, res) => {
  res.status(200).json({ ok: true });
});

// Get an invitation
app.get('/api/invitation/:invitation_id', async (req, res) => {
  const invitationId = req.params.invitation_id;

  console.log('GET /api/invitation/', invitationId);

  try {
    const result = await pool.query(
      `
        SELECT
          i.*,
          r.response_data,
          r.last_updated
        FROM invitations i
        LEFT JOIN responses r
          ON i.id = r.invitation_id
        WHERE i.id = $1 OR i.public_token = $1
      `,
      [invitationId]
    );

    if (result.rows.length === 0) {
      console.log('Invitation not found:', invitationId);
      return res.status(404).json({ error: 'Not found' });
    }

    const row = result.rows[0];
    const response = parseJsonField(row.response_data, null);

    console.log('Found invitation:', row.id);

    return res.json({
      qr_code: row.id,
      public_token: row.public_token,
      invite_id: row.invite_id,
      primary_guest: row.primary_guest,
      party_size: row.party_size,
      guests: parseJsonField(row.guests, []),
      has_responded: response !== null,
      response,
      last_updated: row.last_updated || null
    });
  } catch (error) {
    console.error('Invitation query error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Save or update an RSVP response
app.post('/api/save-response', async (req, res) => {
  const { invitation_id, response_data } = req.body;

  if (!invitation_id) {
    return res.status(400).json({
      error: 'invitation_id is required'
    });
  }

  if (!Array.isArray(response_data)) {
    return res.status(400).json({
      error: 'response_data must be an array'
    });
  }

  console.log('POST /api/save-response for', invitation_id);

  try {
    const resolvedInvitationId = await resolveInvitationKey(invitation_id);

    if (!resolvedInvitationId) {
      return res.status(404).json({
        error: 'Invitation not found'
      });
    }

    await pool.query(
      `
        INSERT INTO responses (
          invitation_id,
          response_data,
          last_updated
        )
        VALUES ($1, $2, CURRENT_TIMESTAMP)

        ON CONFLICT (invitation_id) DO UPDATE SET
          response_data = EXCLUDED.response_data,
          last_updated = CURRENT_TIMESTAMP
      `,
      [resolvedInvitationId, JSON.stringify(response_data)]
    );

    console.log('Response saved for', resolvedInvitationId);

    return res.json({ success: true });
  } catch (error) {
    console.error('Save error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Get an RSVP response
app.get('/api/get-response/:invitation_id', async (req, res) => {
  const invitationId = req.params.invitation_id;

  console.log('GET /api/get-response/', invitationId);

  try {
    const resolvedInvitationId = await resolveInvitationKey(invitationId);

    if (!resolvedInvitationId) {
      console.log('No response because invitation was not found for', invitationId);
      return res.json(null);
    }

    const result = await pool.query(
      `
        SELECT response_data, last_updated
        FROM responses
        WHERE invitation_id = $1
      `,
      [resolvedInvitationId]
    );

    if (result.rows.length === 0) {
      console.log('No response yet for', resolvedInvitationId);
      return res.json(null);
    }

    const row = result.rows[0];

    console.log('Found response for', resolvedInvitationId);

    return res.json({
      data: parseJsonField(row.response_data, []),
      last_updated: row.last_updated
    });
  } catch (error) {
    console.error('Response query error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Admin: get all invitations and responses
app.get('/api/admin/all-responses', async (_req, res) => {
  console.log('GET /api/admin/all-responses');

  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.primary_guest,
        i.guests,
        r.response_data,
        r.last_updated
      FROM invitations i
      LEFT JOIN responses r
        ON i.id = r.invitation_id
      ORDER BY i.id ASC
    `);

    const formatted = result.rows.flatMap((row) => {
      const guests = parseJsonField(row.guests, []);
      const responses = parseJsonField(row.response_data, null);

      return guests.map((guest, index) => {
        const response = Array.isArray(responses)
          ? responses[index]
          : null;

        return {
          invitation_id: row.id,
          primary_guest: row.primary_guest,
          name: guest.name,
          attended: response
            ? response.attending
              ? 'Yes'
              : 'No'
            : 'Not yet responded',
          course_1: response?.courses?.course_1 || '-',
          course_2: response?.courses?.course_2 || '-',
          course_3: response?.courses?.course_3 || '-',
          dietary: response?.dietary || '-',
          song_suggestion: response?.songSuggestion || '-',
          last_updated: row.last_updated || '-'
        };
      });
    });

    console.log('Returning', formatted.length, 'guest records');

    return res.json({
      responses: formatted
    });
  } catch (error) {
    console.error('Admin query error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Admin: export responses as CSV
app.get('/api/admin/export-csv', async (_req, res) => {
  console.log('GET /api/admin/export-csv');

  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.primary_guest,
        i.guests,
        r.response_data,
        r.last_updated
      FROM invitations i
      LEFT JOIN responses r
        ON i.id = r.invitation_id
      ORDER BY i.id ASC
    `);

    const csvRows = [
      [
        'Invitation ID',
        'Primary Guest',
        'Guest Name',
        'Attending',
        'Course 1',
        'Course 2',
        'Course 3',
        'Dietary Restrictions',
        'Song Suggestion',
        'Last Updated'
      ]
        .map(escapeCsv)
        .join(',')
    ];

    for (const row of result.rows) {
      const guests = parseJsonField(row.guests, []);
      const responses = parseJsonField(row.response_data, null);

      guests.forEach((guest, index) => {
        const response = Array.isArray(responses)
          ? responses[index]
          : null;

        csvRows.push(
          [
            row.id,
            row.primary_guest,
            guest.name,
            response
              ? response.attending
                ? 'Yes'
                : 'No'
              : 'Not yet responded',
            response?.courses?.course_1 || '-',
            response?.courses?.course_2 || '-',
            response?.courses?.course_3 || '-',
            response?.dietary || '-',
            response?.songSuggestion || '-',
            row.last_updated || '-'
          ]
            .map(escapeCsv)
            .join(',')
        );
      });
    }

    const csv = `${csvRows.join('\n')}\n`;

    console.log('CSV generated');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="rsvp-export.csv"'
    );

    return res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

initDatabase()
  .then(() => {
    const port = Number(process.env.PORT) || 3001;

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialise database:', error.message);
    process.exit(1);
  });