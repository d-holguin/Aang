# Aang

Aang is a small application toolkit built on native Web Components. The demo is **The Windward**, an independent editorial journal with story browsing, search, topic filters, article pages, and a saved reading list.

## Run locally

Use Node.js 20.19+ or 22.12+, then:

```sh
npm install
npm run dev
```

Available project commands:

- `npm run dev` starts the Vite development server.
- `npm run typecheck` checks TypeScript without emitting files.
- `npm run build` type checks and creates a production bundle in `dist/`.
- `npm run preview` serves the production bundle locally.

## Try the demo

- Search stories and filter by topic on the home page.
- Open a story at `/stories/:slug`.
- Save stories, then visit `/saved`. The reading list is persisted in local storage.
- Use browser back and forward, or open a story URL directly.

The demo is designed to exercise app needs that can reveal gaps in Aang: route parameters, reusable custom elements, component-local UI state, shared persistent state, nested shadow DOM events, empty states, responsive layouts, and accessibility basics.

## Structure

- `src/framework/` contains the reusable router and store, exported from `src/framework/index.ts`.
- `src/app/` contains the Windward site: route setup, shared state, data, custom elements, styles, and assets.
- `src/app/routes.ts` is the app's route table and element registration point.
- `src/app/data/stories.ts` contains story metadata; `src/app/content/stories/*.md` contains article prose.
- `src/app/components/story-card/` and `src/app/components/pages/story-page/` show the split component pattern: behavior in TypeScript, static markup in sibling HTML files, and shadow styles in sibling CSS files.
- Vite imports component HTML with `?raw` and processed CSS with `?inline`; story Markdown and Marked are loaded only when an article opens. The Markdown files are trusted project content. Sanitize rendered HTML before using content from users or other untrusted sources. [Vite import options](https://vite.dev/guide/assets), [Vite CSS imports](https://vite.dev/guide/features.html)
- `src/app/components/story-grid.ts` demonstrates reusable custom elements.
- `src/app/main.ts` is the Vite entry point.

## Framework shape

Aang deliberately leaves rendering to the component author. It has no template compiler or automatic change detection: components use standard custom element lifecycle callbacks and update the DOM they own. `Store<State>` handles shared state; input search and category filters stay local to the story grid. The router supports exact paths and `:parameter` segments, preserves query strings, and emits bubbling `aang:navigate` and `aang:routechange` events.

The router accepts an optional `basePath`; the demo passes Vite's `import.meta.env.BASE_URL` and uses `routeHref()` for app links. Vite uses `/` for local builds and derives the project prefix from `GITHUB_REPOSITORY` in GitHub Actions. For a manual project-site build, set `AANG_BASE_PATH=/Aang/ npm run build`. The generated `404.html` fallback handles direct navigation on static hosts.

`Router.navigate(path)` accepts an app route such as `/stories/example`. It preserves query strings and hashes, applies the configured base path, and emits `aang:navigate` for every resolved URL. When only the path stays the same, the active page receives `aang:routechange`, including query changes. Route parameters are decoded before they are assigned as attributes. Static route segments take precedence over parameters at the same position.

The demo's `<app-root>` exposes `navigate(path)` for programmatic navigation. `Store<State>` performs shallow merges and freezes its top-level state object. Treat nested values as immutable and replace them when updating; each subscription is called immediately, and a failing listener is logged without blocking other listeners.
