# Sentrion frontend

React + TypeScript + Tailwind. Existing dashboard visuals are reused, with signup/signin pages matching the dark UI.

Read [the project README](../README.md) for setup, auth flow, public demo behavior, protected routes and manual verification. From this directory run `npm ci`, configure `VITE_API_BASE_URL`, then `npm run dev`. Verify with `npm run build` and `npm run lint`.

Authentication is centralized in `src/auth/`, session storage and request headers in `src/services/`. Public dashboard hooks explicitly select `demoService`; authenticated hooks request real owner-scoped API data. API errors never switch to demo data. Camera connection testing, streaming and persisted settings remain future work.
