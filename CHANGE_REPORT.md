# Authentication milestone change report

## Result

Implemented signup/login, verified expiring JWTs, session restoration, logout, protected pages, isolated user resources, a separate public demo and real empty dashboards. Existing camera registration is owner-scoped and credentials are encrypted at rest. The dashboard design is preserved.

## Verification

- Frontend: production build and ESLint pass.
- Backend: all 16 authentication, ownership, credential encryption and migration tests pass (`backend/tests`).
- No live PostgreSQL instance, physical camera or browser runtime was available for end-to-end deployment checks. Tests use disposable SQLite databases.

## Scope still pending

RTSP/ONVIF connectivity, Add Camera form expansion (port/description), test-before-save workflow, camera worker interface, live streaming, YOLO and face matching. The current camera connection button explicitly reports unavailable; cameras register offline. Persistent settings also remain future work.

## Implementation details and running

The project `README.md` contains authentication endpoints, protected routes, JWT and session strategy, demo/real data selection, ownership checks, encrypted camera fields, database migrations, dependencies, exact run/upgrade commands and the manual browser test procedure. Read the existing-database upgrade section before running migrations against an existing installation.

## Files created

- `CHANGE_REPORT.md`
- `backend/alembic/versions/0001_baseline.py`
- `backend/alembic/versions/0002_auth_security.py`
- `backend/app/core/encryption.py`
- `backend/app/dependencies/ownership.py`
- `backend/app/routers/auth.py`
- `backend/requirements-dev.txt`
- `backend/scripts/adopt_existing_schema.py`
- `backend/tests/test_auth_isolation.py`
- `backend/tests/test_migrations.py`
- `frontend/package-lock.json`
- `frontend/src/auth/AuthProvider.tsx`
- `frontend/src/auth/useAuth.ts`
- `frontend/src/pages/AuthPage.tsx`
- `frontend/src/services/demoService.ts`
- `frontend/src/services/session.ts`

## Files modified

- `README.md`
- `backend/.env.example`
- `backend/README.md`
- `backend/app/core/config.py`
- `backend/app/core/database.py`
- `backend/app/core/security.py`
- `backend/app/dependencies/auth.py`
- `backend/app/main.py`
- `backend/app/models/camera.py`
- `backend/app/models/user.py`
- `backend/app/routers/activity.py`
- `backend/app/routers/alerts.py`
- `backend/app/routers/cameras.py`
- `backend/app/routers/dashboard.py`
- `backend/app/routers/notifications.py`
- `backend/app/routers/profile.py`
- `backend/app/routers/security_events.py`
- `backend/app/routers/users.py`
- `backend/app/schemas/activity.py`
- `backend/app/schemas/alert.py`
- `backend/app/schemas/camera.py`
- `backend/app/schemas/notification.py`
- `backend/app/schemas/security_event.py`
- `backend/app/schemas/user.py`
- `backend/app/services/activity_service.py`
- `backend/app/services/alert_service.py`
- `backend/app/services/camera_service.py`
- `backend/app/services/notification_service.py`
- `backend/app/services/security_event_service.py`
- `backend/app/services/user_service.py`
- `backend/requirements.txt`
- `backend/scripts/seed_dev_data.py`
- `frontend/.env.example`
- `frontend/README.md`
- `frontend/src/App.tsx`
- `frontend/src/components/activity/ActivityRow.tsx`
- `frontend/src/components/cameras/AddCameraModal.tsx`
- `frontend/src/components/cameras/CameraTable.tsx`
- `frontend/src/components/common/FormField.tsx`
- `frontend/src/components/dashboard/StatCard.tsx`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/Topbar.tsx`
- `frontend/src/components/layout/navConfig.ts`
- `frontend/src/components/live/LivePlayer.tsx`
- `frontend/src/hooks/useAlerts.ts`
- `frontend/src/hooks/useCurrentUser.ts`
- `frontend/src/hooks/useDashboardStats.ts`
- `frontend/src/hooks/useNotifications.ts`
- `frontend/src/layouts/AppLayout.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/LiveMonitoringPage.tsx`
- `frontend/src/services/activityService.ts`
- `frontend/src/services/alertService.ts`
- `frontend/src/services/api.ts`
- `frontend/src/services/cameraService.ts`
- `frontend/src/services/dashboardService.ts`
- `frontend/src/services/detectionService.ts`
- `frontend/src/services/notificationService.ts`
- `frontend/src/services/realtimeService.ts`
- `frontend/src/services/securityEventService.ts`
- `frontend/src/services/userService.ts`
- `frontend/src/vite-env.d.ts`
- `frontend/vite.config.ts`
