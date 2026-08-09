import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

function getArg(name, fallback) {
  const args = process.argv.slice(2);
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
}

function sanitizeFilePart(value) {
  return String(value).replace(/[^a-zA-Z0-9-_]/g, '_');
}

function getGuestDisplayName(guest) {
  if (guest?.name) return guest.name;
  return [guest?.first_name, guest?.second_name].filter(Boolean).join(' ');
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const root = path.resolve(path.dirname(__filename), '..');
  const sourcePath = path.resolve(
    root,
    getArg('--source', '../backend/invitations.json')
  );
  const outputPath = path.resolve(root, getArg('--out', 'output'));
  const baseUrl = (getArg('--base-url', 'https://alyza-and-marks-wedding.com') || '').replace(/\/$/, '');

  if (!baseUrl) {
    throw new Error('Missing --base-url argument.');
  }

  const raw = await fs.readFile(sourcePath, 'utf8');
  const invitations = JSON.parse(raw);

  const qrDir = path.join(outputPath, 'qrs');

  await fs.rm(outputPath, { recursive: true, force: true });
  await fs.mkdir(qrDir, { recursive: true });

  const manifestRows = ['invite_id,public_token,primary_guest,all_guests,url,qr_png'];
  let count = 0;

  for (const item of Object.values(invitations)) {
    const publicToken = item.public_token || item.qr_code;
    const guestName = item.primary_guest;
    const allGuests = Array.isArray(item.guests)
      ? item.guests.map(getGuestDisplayName).filter(Boolean).join(', ')
      : '';
    const url = `${baseUrl}/invite?id=${encodeURIComponent(publicToken)}`;

    const qrPng = await QRCode.toBuffer(url, {
      type: 'png',
      width: 380,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#7c1a2bff',
        light: '#ffffffff'
      }
    });

    const qrFile = `${sanitizeFilePart(item.qr_code)}.png`;
    await fs.writeFile(path.join(qrDir, qrFile), qrPng);

    manifestRows.push([item.qr_code, publicToken, guestName, allGuests, url, `qrs/${qrFile}`].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    count += 1;
  }

  await fs.writeFile(path.join(outputPath, 'manifest.csv'), `${manifestRows.join('\n')}\n`, 'utf8');

  console.log(`Generated ${count} invitation QR files (png style).`);
  console.log(`Output: ${outputPath}`);
  console.log('Use output/manifest.csv to verify each URL before printing.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
