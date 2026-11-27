# Free deployment setup: Vercel + Firebase

Vercel serves the existing Next.js frontend and FastAPI backend. Firebase Spark provides Authentication and Firestore. This setup does not provision a separate file-storage service. The old file endpoints are disabled on Vercel because the site does not need persistent uploaded/generated files. No Cloud Run, Render, database host, Firebase Storage, or Blob account is needed.

The frontend and API are separate Vercel projects in the same Vercel account: the existing frontend project uses `frontend/`; create an API project using `backend/`.

## Free plan constraints

- Firestore's free database quota currently includes 1 GiB stored data, 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day, and 10 GiB/month outbound transfer. Quotas apply to one database; check [Firebase pricing](https://firebase.google.com/docs/firestore/pricing) for current limits.
- Vercel Hobby has function usage limits and is restricted to non-commercial personal use under its [plan terms](https://vercel.com/docs/plans/hobby). Confirm the portal fits those terms before deploying.
- The backend serializes database requests with a Firestore lock and restores SQLite from a Firestore snapshot. This keeps the existing SQL API for low traffic, but adds latency and uses Firestore reads/writes. It is not a high-availability relational database.

## 1. Set up Firebase

1. Keep `examhub-india-6ba59` on the Spark plan; do not link a billing account.
2. Create one Cloud Firestore database in Native mode and choose its region.
3. In Firebase Authentication, enable **Email/Password**.
4. Install the Firebase CLI if needed (`npm install -g firebase-tools`), sign in (`firebase login`), then from the repository root deploy the Firestore rules:

   ```powershell
   firebase deploy --project examhub-india-6ba59 --only firestore:rules
   ```

   The rules deny browser access to private snapshot and identity-link collections.
5. Create/use a Firebase service account with Firestore access (grant **Cloud Datastore User** on the project). Keep its email and private key available as server-only environment variables. Never commit the key.

## 2. Prepare the database snapshot before deploying the API

The first API startup creates a snapshot if none exists. Therefore, import the authoritative local SQLite database **before making the API's first request**.

Install the backend requirements locally if needed, then run the read-only dry run:

```powershell
python -m pip install -r backend/requirements.txt
python backend/scripts/publish_sqlite_snapshot.py --database examhub_india.db
```

Review the reported database size, tables, and rows. The current local database has three file-path references (a stored-document path, preview path, and scorecard path), and none of those files exist locally. This deployment has no file-storage service, so the import command below clears those obsolete references in a temporary copy, while preserving the source database and other rows. The database also already contains one admin record; setting `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` will not change an existing admin password. Use the existing admin credentials, or recover/update that account before snapshotting if you do not know them. The importer uses Node.js and a service-account JSON file to publish over HTTPS, so it does not require Python's native Firestore gRPC library.

Then publish. Replace the example path with the location of your downloaded JSON key file. Keep that file private.

```powershell
python backend/scripts/publish_sqlite_snapshot.py `
  --database examhub_india.db `
  --project-id examhub-india-6ba59 `
  --service-account "E:\path\to\firebase-service-account.json" `
  --omit-file-references `
  --apply
```

The importer refuses to replace an existing snapshot unless `--replace-existing` is also explicitly supplied. Do not publish an empty or stale database. The local SQLite file may not include records previously held only in Vercel's in-memory routes; export those separately if they are real production data.

## 3. Deploy the FastAPI backend

1. In Vercel, import the same Git repository as a new project named `examhub-api`; set **Root Directory** to `backend`. Vercel uses `main.py` as the FastAPI entry point. See the [Vercel FastAPI guide](https://vercel.com/kb/guide/ship-a-fastapi-app-on-vercel).
2. Add these Production environment variables to the API project:

   ```text
   APP_ENV=production
   FIREBASE_PROJECT_ID=examhub-india-6ba59
   FIREBASE_AUTH_ENABLED=true
   FIRESTORE_SQLITE_PERSISTENCE=true
   DATABASE_URL=sqlite+aiosqlite:////tmp/examhub_india.db
   STORAGE_DIR=/tmp/storage
   FRONTEND_ORIGINS=["https://examhub-india.vercel.app"]
   PUBLIC_BASE_URL=https://examhub-india.vercel.app
   ```

   Also set a unique `SECRET_KEY` (at least 32 characters), the initial `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` (at least 14 characters), `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and the SMTP values required for password recovery.
3. Deploy the API project. Check `https://<api-project>.vercel.app/api/health`; it should report healthy Firestore-backed persistence.

## 4. Connect and deploy the frontend

In the existing frontend Vercel project, set:

- `BACKEND_URL` to the API's production URL, without a trailing slash.
- `NEXT_PUBLIC_AUTH_PROVIDER=firebase` and the five `NEXT_PUBLIC_FIREBASE_*` values from Firebase Project settings (API key, auth domain, project ID, messaging sender ID, and app ID).
- `SECRET_KEY` to the exact same value as the API project.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` for existing Firebase Admin scheduled jobs.
- `SUPERADMIN_EMAIL`, a separate random `CRON_SECRET`, and `TELEGRAM_WEBHOOK_SECRET`.

Keep private keys and server secrets unprefixed by `NEXT_PUBLIC_`. Redeploy the frontend. Re-register the Telegram webhook from the admin approvals page after setting its secret.

## Operational limits

Vercel's `/tmp` database is temporary; Firestore snapshots are the recovery source. The shared lock serializes database-backed requests, so concurrent work queues. Each request restores the snapshot and each write publishes one. Monitor Firestore usage. If traffic grows, move to a proper managed relational database and persistent compute.
