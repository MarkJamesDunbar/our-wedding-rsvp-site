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

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getSvgInner(svg) {
  return svg
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .trim();
}

function getSvgViewBox(svg) {
  const match = svg.match(/viewBox="([^"]+)"/i);
  return match ? match[1] : '0 0 41 41';
}

function makeCircularQrSvg({ inviteId, qrInner, qrViewBox }) {
  const safeInvite = escapeXml(inviteId);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <radialGradient id="paper" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f4f0e8" />
    </radialGradient>
    <clipPath id="round">
      <circle cx="540" cy="540" r="500" />
    </clipPath>
  </defs>

  <g clip-path="url(#round)">
    <rect width="1080" height="1080" fill="url(#paper)" />
    <circle cx="540" cy="540" r="480" fill="none" stroke="#7C1A2B" stroke-width="20" />
    <circle cx="540" cy="540" r="300" fill="#ffffff" />
    <svg x="350" y="350" width="380" height="380" viewBox="${qrViewBox}" preserveAspectRatio="xMidYMid meet">
      ${qrInner}
    </svg>
  </g>

  <circle cx="540" cy="540" r="500" fill="none" stroke="#7C1A2B" stroke-width="8" />
  <text x="540" y="1030" text-anchor="middle" font-family="Raleway, Arial, sans-serif" font-size="30" font-weight="700" fill="#7C1A2B">${safeInvite}</text>
</svg>
`;
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const root = path.resolve(path.dirname(__filename), '..');
  const sourcePath = path.resolve(
    root,
    getArg('--source', '../backend/invitations.json')
  );
  const outputPath = path.resolve(root, getArg('--out', 'output'));
  const baseUrl = (getArg('--base-url', 'https://our-wedding-rsvp-site.vercel.app') || '').replace(/\/$/, '');
  const style = (getArg('--style', 'circular') || 'circular').toLowerCase();

  if (!baseUrl) {
    throw new Error('Missing --base-url argument.');
  }

  if (!['circular', 'plain'].includes(style)) {
    throw new Error('Invalid --style. Use "circular" or "plain".');
  }

  const raw = await fs.readFile(sourcePath, 'utf8');
  const invitations = JSON.parse(raw);

  const qrDir = path.join(outputPath, 'qrs');

  await fs.rm(outputPath, { recursive: true, force: true });
  await fs.mkdir(qrDir, { recursive: true });

  const manifestRows = ['invite_id,primary_guest,url,qr_svg'];
  let count = 0;

  for (const item of Object.values(invitations)) {
    const inviteId = item.qr_code;
    const guestName = item.primary_guest;
    const url = `${baseUrl}/?id=${encodeURIComponent(inviteId)}`;

    const qrSvg = await QRCode.toString(url, {
      type: 'svg',
      width: 380,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#7c1a2b',
        light: '#ffffff'
      }
    });

    const qrFile = `${sanitizeFilePart(inviteId)}.svg`;
    const outputSvg = style === 'circular'
      ? makeCircularQrSvg({
        inviteId,
        qrInner: getSvgInner(qrSvg),
        qrViewBox: getSvgViewBox(qrSvg)
      })
      : qrSvg;
    await fs.writeFile(path.join(qrDir, qrFile), outputSvg, 'utf8');

    manifestRows.push([inviteId, guestName, url, `qrs/${qrFile}`].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    count += 1;
  }

  await fs.writeFile(path.join(outputPath, 'manifest.csv'), `${manifestRows.join('\n')}\n`, 'utf8');

  console.log(`Generated ${count} invitation QR files (${style} style).`);
  console.log(`Output: ${outputPath}`);
  console.log('Use output/manifest.csv to verify each URL before printing.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
