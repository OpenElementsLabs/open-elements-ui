// Vite resolves side-effect asset imports (e.g. `import "./preview.css"`) at
// build time. TypeScript 6 rejects such imports without a declaration (TS2882),
// so pull in Vite's client types, which declare the asset modules.
/// <reference types="vite/client" />
