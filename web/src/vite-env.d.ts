/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Adresse de l'API si elle est hébergée ailleurs que le site (ex. Vercel + API séparée). Vide = même origine. */
  readonly VITE_API_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
