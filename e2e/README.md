# Playwright E2E tests

The Playwright configuration starts the Angular application at `http://127.0.0.1:4200` and relies on its development proxy to reach the API at `http://localhost:5049`. Start the API before running the authenticated tests.

Set credentials for an existing admin account in the shell that runs the suite. `TMS_ADMIN_USER` is accepted as an alias for `TMS_ADMIN_EMAIL`.

```powershell
$env:TMS_ADMIN_EMAIL = 'admin@example.test'
$env:TMS_ADMIN_PASS = 'replace-with-the-admin-password'
npm run e2e
```

`playwright/.auth/admin.json` is generated after successful setup and contains browser storage, including the access token. It is ignored by Git and must never be committed.
