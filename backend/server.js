const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./wedding.db', (err) => {
  if (err) console.error(err);
  else console.log('Connected to SQLite');
});

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY,
      invite_id TEXT,
      primary_guest TEXT,
      party_size INTEGER,
      guests TEXT
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY,
      invitation_id TEXT UNIQUE,
      response_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed invitations
  db.get(`SELECT COUNT(*) as count FROM invitations`, (err, row) => {
    if (row.count === 0) {
      const candidatePaths = [
        path.join(__dirname, 'data/invitations.json'),
        path.join(__dirname, '../wedding-rsvp/src/data/invitations.json')
      ];
      const invitationsPath = candidatePaths.find(filePath => fs.existsSync(filePath));

      if (!invitationsPath) {
        console.warn('No invitations.json found; skipping seed');
        return;
      }

      try {
        const invitations = JSON.parse(fs.readFileSync(invitationsPath, 'utf8'));

        Object.values(invitations).forEach(inv => {
          db.run(
            `INSERT INTO invitations (id, invite_id, primary_guest, party_size, guests) VALUES (?, ?, ?, ?, ?)`,
            [inv.qr_code, inv.invite_id, inv.primary_guest, inv.party_size, JSON.stringify(inv.guests)]
          );
        });
        console.log('✓ Seeded invitations');
      } catch (seedErr) {
        console.error('Failed to seed invitations:', seedErr);
      }
    }
  });
});

// Get invitation
app.get('/api/invitation/:invitation_id', (req, res) => {
  db.get(
    `SELECT * FROM invitations WHERE id = ?`,
    [req.params.invitation_id],
    (err, row) => {
      if (err) res.status(500).json({ error: err.message });
      else if (row) {
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
    }
  );
});

// Save response
app.post('/api/save-response', (req, res) => {
  const { invitation_id, response_data } = req.body;
  console.log('Saving:', invitation_id, response_data);
  db.run(
    `INSERT OR REPLACE INTO responses (invitation_id, response_data, last_updated) VALUES (?, ?, CURRENT_TIMESTAMP)`,
    [invitation_id, JSON.stringify(response_data)],
    (err) => {
      if (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: err.message });
      }
      else {
        console.log('Saved successfully');
        res.json({ success: true });
      }
    }
  );
});

// Get response
app.get('/api/get-response/:invitation_id', (req, res) => {
  db.get(
    `SELECT response_data, last_updated FROM responses WHERE invitation_id = ?`,
    [req.params.invitation_id],
    (err, row) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(row ? { data: JSON.parse(row.response_data), last_updated: row.last_updated } : null);
    }
  );
});

// Get all invitations with responses (admin)
app.get('/api/admin/all-responses', (req, res) => {
  db.all(
    `SELECT i.id, i.primary_guest, i.guests, r.response_data, r.last_updated 
     FROM invitations i 
     LEFT JOIN responses r ON i.id = r.invitation_id 
     ORDER BY i.id ASC`,
    [],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else {
        const formatted = rows.map(row => {
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
  db.all(
    `SELECT i.id, i.primary_guest, i.guests, r.response_data, r.last_updated 
     FROM invitations i 
     LEFT JOIN responses r ON i.id = r.invitation_id 
     ORDER BY i.id ASC`,
    [],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else {
        let csv = 'Invitation ID,Primary Guest,Guest Name,Attending,Course 1,Course 2,Course 3,Dietary Restrictions,Last Updated\n';
        
        rows.forEach(row => {
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));