# Aang

Aang is a small single page application framework experiment built on native Web Components. It includes a typed observable store and a lightweight history router.

## Development

Use Node.js 20.19+ or 22.12+, install dependencies, and start the Vite development server:

```sh
npm install
npm run dev
```

The app is served at the local URL printed by Vite. The `/` and `/about` routes work in development, including direct navigation and browser back/forward.

## Scripts

- `npm run dev` starts Vite.
- `npm run typecheck` checks TypeScript without emitting files.
- `npm run build` type checks and creates a production bundle in `dist/`.
- `npm run preview` serves the production bundle locally.

## Structure

- `src/core/router.ts` handles `data-link` navigation, browser history, and route rendering.
- `src/core/store.ts` provides typed local/global state with subscriptions and cleanup functions.
- `src/components/` contains the custom elements.
- `src/main.ts` loads global styles and registers the app root.

For static hosting, configure the host to serve `index.html` for unknown paths. The included `public/404.html` fallback is copied into `dist/` and restores the original path on GitHub Pages.
