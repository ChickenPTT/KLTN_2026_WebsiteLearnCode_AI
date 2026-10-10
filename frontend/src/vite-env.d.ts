/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL cua backend Spring Boot. Rong = dung proxy /api cua Vite. */
  readonly VITE_API_BASE_URL?: string;
  /** 'api' | 'mock' | 'auto' (mac dinh: dung backend, backend tat thi dung mock) */
  readonly VITE_AUTH_MODE?: 'api' | 'mock' | 'auto';
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
