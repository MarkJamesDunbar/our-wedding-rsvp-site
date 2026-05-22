const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create tables
pool.query(`
  CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    invite_id TEXT,
    primary_guest TEXT,
    party_size INTEGER,
    guests TEXT
  )
`);

pool.query(`
  CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    invitation_id TEXT UNIQUE,
    response_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed invitations
pool.query('SELECT COUNT(*) as count FROM invitations', (err, result) => {
  if (result.rows[0].count === 0) {
    const invitationsPath = path.join(__dirname, 'invitations.json');
    const invitations = JSON.parse(fs.readFileSync(invitationsPath));
    
    Object.values(invitations).forEach(inv => {
      pool.query(
        `INSERT INTO invitations (id, invite_id, primary_guest, party_size, guests) VALUES ($1, $2, $3, $4, $5)`,
        [inv.qr_code, inv.invite_id, inv.primary_guest, inv.party_size, JSON.stringify(inv.guests)]
      );
    });
    console.log('✓ Seeded invitations');
  }
});

// Get invitation
app.get('/api/invitation/:invitation_id', (req, res) => {
  pool.query('SELECT * FROM invitations WHERE id = $1', [req.params.invitation_id], (err, result) => {
    if (err) res.status(500).json({ error: err.message });
    else if (result.rows.length > 0) {
      const row = result.rows[0];
      res.json({
        qr_code: row.id,
        invite_id: row.invite_id,
        primary_guest: row.primary_guest,
        party_size: row.party_size,
        guests: JSON.parse(row.guests),
        has_responded: false,
        response: null
      });
    } else res.status(404).json({ error: 'Not found' });
  });
});

// Save response
app.post('/api/save-response', (req, res) => {
  const { invitation_id, response_data } = req.body;
  console.log('Saving:', invitation_id);
  pool.query(
    `INSERT INTO responses (invitation_id, response_data, last_updated) VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (invitation_id) DO UPDATE SET response_data = $2, last_updated = CURRENT_TIMESTAMP`,
    [invitation_id, JSON.stringify(response_data)],
    (err) => {
      if (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: err.message });
      } else {
        console.log('Saved successfully');
        res.json({ success: true });
      }
    }
  );
});

// Get response
app.get('/api/get-response/:invitation_id', (req, res) => {
  pool.query(
    `SELECT response_data, last_updated FROM responses WHERE invitation_id = $1`,
    [req.params.invitation_id],
    (err, result) => {
      if (err) res.status(500).json({ error: err.message });
      else if (result.rows.length > 0) {
        const row = result.rows[0];
        res.json({ data: JSON.parse(row.response_data), last_updated: row.last_updated });
      } else res.json(null);
    }
  );
});

// Get all invitations with responses (admin)
app.get('/api/admin/all-responses', (req, res) => {
  pool.query(
    `SELECT i.id, i.primary_guest, i.guests, r.response_data, r.last_updated 
     FROM invitations i 
     LEFT JOIN responses r ON i.id = r.invitation_id 
     ORDER BY i.id ASC`,
    (err, result) => {
      if (err) res.status(500).json({ error: err.message });
      else {
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
        res.json({ responses: formatted });
      }
    }
  );
});

// Export CSV
app.get('/api/admin/export-csv', (req, res) => {
  pool.query(
    `SELECT i.id, i.primary_guest, i.guests, r.response_data, r.last_updated 
     FROM invitations i 
     LEFT JOIN responses r ON i.id = r.invitation_id 
     ORDER BY i.id ASC`,
    (err, result) => {
      if (err) res.status(500).json({ error: err.message });
      else {
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
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="rsvp-export.csv"');
        res.send(csv);
      }
    }
  );
});

app.get('/api/seed', (req, res) => {
  const invitationsPath = path.join(__dirname, 'invitations.json');
  const invitations = JSON.parse(fs.readFileSync(invitationsPath));
  
  let count = 0;
  Object.values(invitations).forEach(inv => {
    pool.query(
      `INSERT INTO invitations (id, invite_id, primary_guest, party_size, guests) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [inv.qr_code, inv.invite_id, inv.primary_guest, inv.party_size, JSON.stringify(inv.guests)],
      (err) => {
        if (!err) count++;
        if (count === Object.values(invitations).length) {
          res.json({ seeded: count });
        }
      }
    );
  });
});

app.listen(3001, () => console.log('Server running on port 3001'));