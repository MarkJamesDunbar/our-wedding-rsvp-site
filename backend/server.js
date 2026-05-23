process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

console.log('🚀 Server starting...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ NOT SET');
console.log('=== ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  console.log('DB Host:', url.hostname);
  console.log('DB Port:', url.port);
  console.log('DB Name:', url.pathname);
  console.log('Full URL:', process.env.DATABASE_URL);
} else {
  console.log('⚠️  DATABASE_URL is NOT set!');
}
console.log('=== END DEBUG ===');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('error', (err) => {
  console.error('❌ Pool error:', err.message);
});

pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL');
});

function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Seed invitations from invitations.json (runs once on startup)
async function seedInvitations() {
  console.log('🌱 Seeding invitations from invitations.json...');
  try {
    const invitationsPath = path.join(__dirname, 'invitations.json');
    console.log('📂 Reading:', invitationsPath);
    const invitations = JSON.parse(fs.readFileSync(invitationsPath, 'utf8'));
    const entries = Object.values(invitations);
    console.log('📋 Found', entries.length, 'invitations to seed');

    let seeded = 0;
    for (const inv of entries) {
      await queryAsync(
        `INSERT INTO invitations (id, invite_id, primary_guest, party_size, guests)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
        [inv.qr_code, inv.invite_id, inv.primary_guest, inv.party_size, JSON.stringify(inv.guests)]
      );
      seeded++;
    }
    console.log('✓ Seeded', seeded, 'invitations (duplicates skipped)');
  } catch (err) {
    console.warn('⚠️  Seeding failed — server will continue without seed data:', err.message);
  }
}

// Create tables then seed
async function initDatabase() {
  try {
    await queryAsync(`
      CREATE TABLE IF NOT EXISTS invitations (
        id TEXT PRIMARY KEY,
        invite_id TEXT,
        primary_guest TEXT,
        party_size INTEGER,
        guests TEXT
      )
    `, []);
    console.log('✓ Invitations table ready');

    await queryAsync(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        invitation_id TEXT UNIQUE,
        response_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, []);
    console.log('✓ Responses table ready');

    await queryAsync('SELECT NOW()', []);
    console.log('✓ Database connection working');

    await seedInvitations();
  } catch (err) {
    console.error('❌ Database initialisation failed:', err.message);
    throw err;
  }
}

// Get invitation
app.get('/api/invitation/:invitation_id', (req, res) => {
  console.log('📖 GET /api/invitation/', req.params.invitation_id);
  pool.query('SELECT * FROM invitations WHERE id = $1', [req.params.invitation_id], (err, result) => {
    if (err) {
      console.error('❌ Query error:', err.message);
      res.status(500).json({ error: err.message });
    } else if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log('✓ Found invitation:', row.id);
      res.json({
        qr_code: row.id,
        invite_id: row.invite_id,
        primary_guest: row.primary_guest,
        party_size: row.party_size,
        guests: JSON.parse(row.guests),
        has_responded: false,
        response: null
      });
    } else {
      console.log('⚠️  Invitation not found:', req.params.invitation_id);
      res.status(404).json({ error: 'Not found' });
    }
  });
});

// Save response
app.post('/api/save-response', (req, res) => {
  const { invitation_id, response_data } = req.body;
  console.log('💾 POST /api/save-response for', invitation_id);
  pool.query(
    `INSERT INTO responses (invitation_id, response_data, last_updated) VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (invitation_id) DO UPDATE SET response_data = $2, last_updated = CURRENT_TIMESTAMP`,
    [invitation_id, JSON.stringify(response_data)],
    (err) => {
      if (err) {
        console.error('❌ Save error:', err.message);
        res.status(500).json({ error: err.message });
      } else {
        console.log('✓ Response saved for', invitation_id);
        res.json({ success: true });
      }
    }
  );
});

// Get response
app.get('/api/get-response/:invitation_id', (req, res) => {
  console.log('📖 GET /api/get-response/', req.params.invitation_id);
  pool.query(
    `SELECT response_data, last_updated FROM responses WHERE invitation_id = $1`,
    [req.params.invitation_id],
    (err, result) => {
      if (err) {
        console.error('❌ Query error:', err.message);
        res.status(500).json({ error: err.message });
      } else if (result.rows.length > 0) {
        const row = result.rows[0];
        console.log('✓ Found response for', req.params.invitation_id);
        res.json({ data: JSON.parse(row.response_data), last_updated: row.last_updated });
      } else {
        console.log('⚠️  No response yet for', req.params.invitation_id);
        res.json(null);
      }
    }
  );
});

// Admin: Get all responses
app.get('/api/admin/all-responses', (req, res) => {
  console.log('📊 GET /api/admin/all-responses');
  pool.query(
    `SELECT i.id, i.primary_guest, i.guests, r.response_data, r.last_updated 
     FROM invitations i 
     LEFT JOIN responses r ON i.id = r.invitation_id 
     ORDER BY i.id ASC`,
    (err, result) => {
      if (err) {
        console.error('❌ Query error:', err.message);
        res.status(500).json({ error: err.message });
      } else {
        const formatted = result.rows.map(row => {
          const guests = JSON.parse(row.guests);
          const responses = row.response_data ? JSON.parse(row.response_data) : null;
          
          return guests.map((guest, idx) => {
            const response = responses ? responses[idx] : null;
            return {
              invitation_id: row.id,
              primary_guest: row.primary_guest,
              name: guest.name,
              attended: response ? (response.attending ? 'Yes' : 'No') : 'Not yet responded',
              course_1: response?.courses?.course_1 || '-',
              course_2: response?.courses?.course_2 || '-',
              course_3: response?.courses?.course_3 || '-',
              dietary: response?.dietary || '-',
              last_updated: row.last_updated || '-'
            };
          });
        }).flat();
        console.log('✓ Returning', formatted.length, 'guest records');
        res.json({ responses: formatted });
      }
    }
  );
});

// Admin: Export CSV
app.get('/api/admin/export-csv', (req, res) => {
  console.log('📥 GET /api/admin/export-csv');
  pool.query(
    `SELECT i.id, i.primary_guest, i.guests, r.response_data, r.last_updated 
     FROM invitations i 
     LEFT JOIN responses r ON i.id = r.invitation_id 
     ORDER BY i.id ASC`,
    (err, result) => {
      if (err) {
        console.error('❌ Query error:', err.message);
        res.status(500).json({ error: err.message });
      } else {
        let csv = 'Invitation ID,Primary Guest,Guest Name,Attending,Course 1,Course 2,Course 3,Dietary Restrictions,Last Updated\n';
        
        result.rows.forEach(row => {
          const guests = JSON.parse(row.guests);
          const responses = row.response_data ? JSON.parse(row.response_data) : null;
          
          guests.forEach((guest, idx) => {
            const response = responses ? responses[idx] : null;
            const attended = response ? (response.attending ? 'Yes' : 'No') : 'Not yet responded';
            const course1 = response?.courses?.course_1 || '-';
            const course2 = response?.courses?.course_2 || '-';
            const course3 = response?.courses?.course_3 || '-';
            const dietary = response?.dietary || '-';
            const lastUpdated = row.last_updated || '-';
            
            csv += `"${row.id}","${row.primary_guest}","${guest.name}","${attended}","${course1}","${course2}","${course3}","${dietary}","${lastUpdated}"\n`;
          });
        });
        
        console.log('✓ CSV generated');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="rsvp-export.csv"');
        res.send(csv);
      }
    }
  );
});

(async () => {
  await initDatabase();
  app.listen(3001, () => {
    console.log('✓ Server running on port 3001');
  });
})().catch(err => {
  console.error('❌ Startup failed:', err);
  process.exit(1);
});