/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL cua backend Spring Boot. Rong = dung proxy /api cua Vite. */
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
