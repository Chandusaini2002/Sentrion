/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /**
   * Temporary stand-in for authentication. Every backend list/create
   * endpoint scopes data by owner via an explicit user_id (see
   * backend/app/dependencies/auth.py) since there's no login yet. Set
   * this to the id printed by `python -m scripts.seed_dev_data`.
   * Removed once the auth stage adds a real session/token.
   */
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
