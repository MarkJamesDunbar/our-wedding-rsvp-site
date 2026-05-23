# Deployment Guide

This repository is split into:

- `backend` (Node + Express + PostgreSQL) for Railway
- `wedding-rsvp` (React + Vite) for Vercel

## 1) Deploy Backend (Railway)

1. Create a new Railway project from the `backend` folder.
2. Add a PostgreSQL service in Railway.
3. Set backend environment variables:
   - `DATABASE_URL` from Railway Postgres
   - `DATABASE_SSL=true`
   - `CORS_ORIGIN=https://your-frontend-domain.vercel.app`
4. Deploy.
5. Confirm health endpoint works at `/healthz`.

## 2) Deploy Frontend (Vercel)

1. Create a Vercel project from the `wedding-rsvp` folder.
2. Set environment variable:
   - `VITE_API_BASE_URL=https://your-backend-domain.up.railway.app`
3. Deploy.
4. Verify RSVP links like `/invite?id=<invitation_id>`.

## 3) Post-Deploy Checks

- Open frontend and submit one RSVP response.
- Confirm row appears in `/admin`.
- Download CSV and verify content.
