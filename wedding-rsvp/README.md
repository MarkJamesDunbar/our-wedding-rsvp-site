# Wedding RSVP Frontend

React + Vite frontend for the wedding RSVP flow.

## Environment

Copy `.env.example` to `.env` and set:

- `VITE_API_BASE_URL`: Full backend URL (for example `https://your-backend-domain.up.railway.app`)

For local development, you can leave it empty and proxy API requests from the Vite dev server.

## Run Locally

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

1. Import this `wedding-rsvp` folder as a Vercel project.
2. Set environment variable `VITE_API_BASE_URL` to your Railway backend URL.
3. Build command: `npm run build`
4. Output directory: `dist`

The included `vercel.json` already rewrites all routes to `index.html` for client-side routing.
