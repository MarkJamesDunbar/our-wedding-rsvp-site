# QR Generator (Standalone)

This folder is intentionally separate from the app.

It generates QR code SVG files for every invitation in `../backend/invitations.json`.

## Install

```bash
cd qr-generator
npm install
```

## Generate

```bash
npm run generate -- --base-url https://our-wedding-rsvp-site.vercel.app
```

This generates circular-style QR SVGs by default.

For plain square QR files:

```bash
npm run generate -- --base-url https://our-wedding-rsvp-site.vercel.app --style plain
```

Optional flags:

- `--source` path to invitations JSON (default: `../backend/invitations.json`)
- `--out` output folder (default: `output`)
- `--style` `circular` (default) or `plain`

## Output

- `output/qrs/*.svg` QR files (one per invitation)
- `output/manifest.csv` invite-to-url mapping for verification

## Print Flow

1. Open `output/manifest.csv` and spot-check URL mappings.
2. Print individual files from `output/qrs` for envelopes.
