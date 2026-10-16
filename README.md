# Sentrion — authentication milestone

Sentrion is a separate security-camera project built with React, TypeScript, FastAPI, SQLAlchemy and PostgreSQL. This update implements the first milestone: public demo → signup/login → private empty dashboard → refresh → logout. Existing dashboard cards, tables, colors and layout are reused.

## What works

- Public `/` uses frontend-only demo fixtures and never creates anonymous database records. The uploaded ZIP contained settings/detection mocks but no camera/event demo fixtures; `demoService.ts` supplies those missing examples.
- Signup normalizes emails, validates names/passwords, rejects duplicate emails and creates the existing User + UserProfile. Passwords are bcrypt hashed; existing bcrypt accounts remain compatible. Passwords require 8 characters and at most 72 UTF-8 bytes to prevent bcrypt truncation.
- Login verifies password/account status and returns an expiring HS256 JWT and safe profile. `/api/auth/me` verifies and restores the current user.
- A central AuthProvider and HTTP client manage authentication. The bearer token is stored in `localStorage` under `sentrion.session`, restored through `/auth/me`, and removed on logout or protected-request 401. Sessions expire after 60 minutes by default; there is no refresh token. An expiry timer returns the UI to login. Use HTTPS when deploying: browser storage is readable by same-origin JavaScript, so XSS prevention remains essential.
- Logout clears this browser's token and authenticated state and returns to `/`. It does not delete any account or resource. Stateless tokens already copied elsewhere remain valid until expiration; server-side revocation is not implemented.
- All resource APIs use verified JWT ownership. Caller-supplied `user_id` cannot select another account. Object access checks ownership; alert/event/activity creation also validates camera ownership. Public user listing and arbitrary user/profile edit routes were removed.
- New accounts have zero statistics, cameras, alerts, notifications and events. API errors never fall back to demo data. Identity changes remount resource state to avoid showing a previous account's data.
- Existing camera registration is now owned by the authenticated user. Camera URL, username and password use Fernet authenticated encryption at rest; responses show only a safe hostname and credential-configured flag. Existing stored secrets are encrypted by migration. Camera configuration changes clear old connection status.

## Milestone boundary

Real RTSP/ONVIF connection tests, port/description/protocol form expansion, camera worker start/stop, live video and YOLO/face matching are **next**, not implemented here. The existing camera form can register an offline camera; it does not require a successful connection yet. Its Test Connection action explicitly reports that testing is unavailable, never fake success. The live view displays a streaming-unavailable message and no fabricated AI results. Settings are a coming-soon page rather than mock settings presented as persisted user data. The public dashboard remains the demo experience.

## Run the backend

Use Python 3.11 or 3.12 and an available PostgreSQL database. These commands start from the extracted `sentrion` directory.

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

For a **new setup**, copy the example. If you already have `.env`, edit it in place and preserve your database URL and any existing keys.

```bash
cp .env.example .env
python -c "import secrets; print(secrets.token_hex(32))"
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Put the first generated value in `SECRET_KEY` and the second in `CAMERA_ENCRYPTION_KEY` in `.env`. Set `DATABASE_URL` to your PostgreSQL connection string and `BACKEND_CORS_ORIGINS` to your frontend origin. Blank or placeholder keys fail startup. Keep the camera encryption key securely backed up with the database; do not regenerate it on restart or an existing encrypted database will be unreadable. The ZIP contains no live keys or database.

### New empty database

```bash
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Existing database

Back up your database and `.env`, and stop backend processes while migrating. No application records are reset or deleted by the upgrades.

```bash
alembic current
```

If the database has **no recorded migration revision** but already contains the original Sentrion tables:

```bash
python -m scripts.adopt_existing_schema
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

The adoption helper compares the existing schema with the uploaded baseline and refuses mismatches before stamping it. If your installation has its own Alembic revisions not included in the original ZIP, preserve those files and reconcile that migration chain before applying this update; do not manually overwrite or stamp over your history. Normalized duplicate emails stop the security migration for review without deleting accounts.

Do not run the seed script for a new real user. `python -m scripts.seed_dev_data` remains an optional, explicit developer fixture writer and is never used for the public demo.

## Run the frontend

In a second terminal, from `sentrion`:

```bash
cd frontend
npm ci
```

For a new setup:

```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL=http://localhost:8000`, or the backend origin reachable from your browser, then:

```bash
npm run dev
```

Open `http://localhost:5173`. On another device, `localhost` means that device: configure your server's reachable address and allowed CORS origin. The development-user environment variable is obsolete; no frontend request sends an owner ID.

## APIs and protected pages

| Endpoint | Behavior |
| --- | --- |
| `POST /api/auth/signup` | Public registration; returns safe profile, HTTP 201 |
| `POST /api/auth/login` | Public login; returns access_token, token_type, expires_in, user |
| `GET /api/auth/me` | Verified current profile; missing/invalid/expired token returns 401 |
| `GET/PATCH /api/users/me` | Own safe account; email editing only |
| `GET/PATCH /api/profile/me` | Own profile |
| `/api/cameras`, `/api/alerts`, `/api/activity`, `/api/security-events`, `/api/notifications` | Authenticated existing operations, scoped to owner |
| `GET /api/dashboard/summary` | Own aggregated statistics |

Protected frontend routes: `/dashboard`, `/cameras`, `/live`, `/live/:cameraId`, `/alerts`, `/activity`, `/profile`, `/settings`. Visitors are redirected to `/login`. `/`, `/login`, `/signup` are public. Authenticated root visitors go to `/dashboard`.

## Database and dependencies

- `0001_baseline`: frozen original schema for clean database setup; adopted only after matching existing unversioned tables.
- `0002_auth_security`: normalized email unique index, widened encrypted camera fields, data-preserving encryption of existing secrets. Downgrades that destroy tables or restore plaintext secrets intentionally refuse execution.
- Reuses all seven existing models/tables; no duplicate user or camera model.
- Added `PyJWT>=2.10,<3.0`, `cryptography>=43,<47`; existing password dependencies retained. Tests use pytest/httpx through `requirements-dev.txt`. No frontend runtime dependencies added; package lock included.

## Verification

```bash
# backend/
pip install -r requirements-dev.txt
python -m pytest tests -q

# frontend/
npm run build
npm run lint
```

All 16 backend tests passed. Backend tests run against disposable SQLite databases, including baseline/upgrade/adoption tests. They never connect to your configured production database. PostgreSQL deployment and actual browser/camera tests must be completed in your environment; there is no PostgreSQL server or installed browser executable in the editing environment.

### Manual browser test

1. Open `/` in a private window. Confirm demo cameras/events and Sign in/Sign up links. Confirm no anonymous API data creation.
2. Visit every protected route while logged out; confirm `/login`.
3. Create User A, using a full name, email and matching password confirmation. Confirm `/dashboard` shows all zeros and no demo cameras/events.
4. Refresh. Confirm User A remains signed in. Edit the profile and confirm the navigation name updates.
5. Open Cameras and save an offline camera. Test Connection must report unavailable. Ensure saved credentials are never displayed.
6. Logout. Confirm `/` shows the public demo. Log back in as A and confirm the camera remains.
7. Create User B in another browser context. Confirm empty lists and zero statistics; A's camera must not appear.
8. Use B's bearer token to GET/PATCH/DELETE A's camera ID: expect 404. Supply `?user_id=<A>` to list APIs: B's own data only. Try linking an alert/event/activity to A's camera: expect 404.
9. Replace the browser token with invalid text and reload: expect login. Test a one-minute session with `ACCESS_TOKEN_EXPIRE_MINUTES=1`; the UI expires and protected APIs return 401.
10. Stop the API and refresh an authenticated page. Confirm a retry error, not demo data. Restart the API and retry.

## Future camera and AI stage

Add protocol-aware bounded RTSP/ONVIF connection services, secure network-target policy for the deployment, test-before-save flow, truthful connection health, a user/camera-bound worker interface, frame extraction, detection and face matching, persistent security events/alerts, and realtime delivery. Password reset, email verification, login throttling, refresh/revocation and persistent settings are also future work.

See `CHANGE_REPORT.md` for the exact changed-file inventory.

## Visitor access (unsigned users)

Unsigned visitors can use four read-focused areas without creating an account:

- Dashboard
- Cameras
- Live Monitoring
- Security Alerts

The visitor experience uses six sample cameras supplied by the FastAPI backend at `/api/public/*`. Five are online and one is offline. Online visitor cameras use the synthetic looping CCTV file served from `/public-media/cctv-loop.mp4`.

Security alerts, recent events, notifications, and detection values refresh automatically from backend-generated visitor data. They are never written into customer PostgreSQL tables.

Visitors may also add a camera from the Cameras page. A visitor-added camera:

- is stored only in browser `sessionStorage`;
- is removed when the browser session ends;
- never stores the supplied username or password;
- appears immediately in Cameras, Dashboard, and Live Monitoring;
- uses the sample looping feed until the visitor signs in and connects a real camera.

Authenticated users continue to use the normal protected PostgreSQL-backed camera, alert, event, profile, and activity APIs.
