# Troubleshooting Login Issue

## Investigation Status
- **Credentials:** Verified (`admin@sekolah.id` / `password`).
- **Database:** User exists and is active.
- **Frontend:** Field names match request (`login`).
- **Logs:** No login errors, but found a migration error: `SQLSTATE[HY000]: General error: 1 no such index: users_identity_number_unique`. This might indicate an inconsistent database schema state, though the user exists.
- **Reproduction:** **Login WORKED** for me when testing with `agent-browser` on `https://management-sekolah.test/`.

## Why it might be failing for you
1. **Browser Cache/Cookies:** You might have old cookies. Try Incognito mode.
2. **Database Sync:** Your local database might not be fully migrated despite the seed. The migration error in logs is suspicious.
3. **Environment:** If you are using `http` vs `https`, or if Herd is not serving the site correctly.

## Recommended Fixes

### 1. Clear Caches
Run these commands to ensure everything is fresh:
```bash
php.bat artisan optimize:clear
php.bat artisan config:clear
php.bat artisan route:clear
php.bat artisan view:clear
```

### 2. Reset Database (If locally safe)
Since the logs show migration errors, a fresh start is recommended:
```bash
php.bat artisan migrate:fresh --seed
```
*Warning: This deletes all data and re-seeds it.*

### 3. Check Browser
- Try logging in via **Incognito / Private Window**.
- Ensure you are using `https://` if your Herd is configured for SSL.
