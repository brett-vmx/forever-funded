/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Allow importing the localhost-only stress gif as a module (dev builds only;
// see HeroSwipe — the import lives in an `import.meta.env.DEV` dead-code branch
// so Rollup drops both the branch and this asset from production bundles).
declare module '*.gif' {
  const src: string
  export default src
}
