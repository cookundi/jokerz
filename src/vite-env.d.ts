/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_X_PROFILE: string;
  readonly VITE_X_POST: string;
  readonly VITE_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
