# Sentrion Visitor Access

## Unsigned navigation

Only these routes are shown in the sidebar:

1. Dashboard (`/`)
2. Cameras (`/cameras`)
3. Live Monitoring (`/live`)
4. Security Alerts (`/alerts`)

The UI does not display a "Demo" label. The footer identifies the session only as `Visitor / Unsigned access`, with Sign in and Sign up available in the top bar.

## Backend sample data

Public endpoints:

- `GET /api/public/dashboard/summary`
- `GET /api/public/cameras`
- `GET /api/public/alerts`
- `GET /api/public/security-events?limit=5`
- `GET /api/public/notifications`
- `GET /api/public/detection/{camera_id}`

The sample video is served by FastAPI from:

- `GET /public-media/cctv-loop.mp4`

There are six backend sample cameras. Five are online and one is offline.

## Live monitoring

Online visitor cameras use the backend-hosted H.264 MP4. The React `<video>` element uses `autoPlay`, `muted`, `loop`, `playsInline`, and browser controls, so the sample footage repeats continuously.

## Rotating security alerts

The backend advances one new visitor alert every eight seconds. The frontend polls every eight seconds. Older rows shift down instead of the entire list changing at once.

## Temporary visitor cameras

Visitors can use Add Camera. These cameras are deliberately not written to PostgreSQL.

They are stored in `sessionStorage` under `sentrion.visitor.cameras.v1`. Username/password values are never persisted. RTSP URLs are redacted before any address is kept in browser storage.

A temporary camera is shown immediately in:

- Cameras
- Dashboard
- Live Monitoring

It uses the same sample visitor stream. Closing the browser session removes it.

## Signed users

Authenticated users retain the existing private behavior:

- PostgreSQL-backed camera CRUD
- JWT authentication
- encrypted camera credentials
- private alerts/events/notifications
- profile/activity/settings routes

Real RTSP/ONVIF testing and MediaMTX streaming remain the next authenticated-camera milestone.

## Per-camera demo footage

The six built-in visitor cameras now use six distinct backend-hosted H.264 MP4 loops:

- `/public-media/front-entrance.mp4`
- `/public-media/rear-parking.mp4`
- `/public-media/main-corridor.mp4`
- `/public-media/loading-dock.mp4`
- `/public-media/server-room.mp4`
- `/public-media/west-gate.mp4`

Dashboard camera cards autoplay their matching muted loop. The sample camera marked offline shows its last recorded preview on the Dashboard, while Live Monitoring still displays the offline state. Temporary visitor cameras randomly choose one of the six demo feeds for their session-only preview.
