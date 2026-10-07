# Authenticated deletion setup

The `/delete` page sends a request. It never deletes a database row from the
browser and it never contains a service role key, database password, or other
administrative credential.

## Required deployment settings

Set these three values in Vercel for the production environment, then redeploy.
They are public browser configuration, not secrets.

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<key>
VITE_AEYRON_API_BASE_URL=https://<Aeyron backend origin>
```

The API origin must expose `POST /v1/data-subject-requests`, validate the
Supabase access token, and accept exactly `https://www.aeyronhealth.co` in its
`CORS_ORIGINS` configuration. The backend request handler already exists in the
Aeyron application. Its release owner must confirm that it is mounted and
healthy before this page is described as available.

## Supabase Auth settings

Set the Site URL to `https://www.aeyronhealth.co` and permit the exact redirect
URL `https://www.aeyronhealth.co/delete`. Keep existing approved redirects.
The flow uses an emailed magic link. It does not collect a password.

## Required acceptance check

Use a disposable, enrolled test account only:

1. Open `/delete` and request a link.
2. Open the link in a browser and confirm the signed-in screen appears.
3. Tick the acknowledgement and submit once.
4. Confirm the backend returns a `submitted` or `processing` receipt, a
   lifecycle job is queued, and the browser signs out.
5. Confirm a second request reports the existing request rather than creating
   another deletion job.
6. Confirm no user email, access token, health data, or service credential is
   written to analytics, browser logs, source control, or a public response.

Do not test this path with a real participant or production account until the
release owner has approved the backend, data-retention and deletion workflow.
