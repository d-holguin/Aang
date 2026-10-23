# Aang

Aang is a small application toolkit built on native Web Components. It adds a typed store and a history router, while leaving component structure, rendering, attributes, events, and styling in the browser's hands.

## Development

Use Node.js 20.19+ or 22.12+, then install dependencies and start Vite:

```sh
npm install
npm run dev
```

The demo has `/`, `/about`, and a not-found page. Vite serves the app locally and falls back to `index.html` for direct route visits.

## Project commands

- `npm run dev` starts the Vite development server.
- `npm run typecheck` checks TypeScript without emitting files.
- `npm run build` type checks and creates a production bundle in `dist/`.
- `npm run preview` serves the production bundle locally.

## What Aang provides

- Native autonomous custom elements registered with `customElements.define()`.
- A history router. Routes map exact paths to custom element names; trailing slashes are ignored. Mark internal links with `data-link`. The router handles browser back/forward, keeps query-only navigation from remounting a page, and emits a bubbling `aang:navigate` event with `{ url, path, query }` detail.
- A small typed `Store<State>` with `getState()`, `setState(partial)`, `update(fn)`, and `subscribe(fn)`. `subscribe` immediately emits the current state and returns an unsubscribe function.
- A static-host fallback at `public/404.html`, copied to the production bundle. The current router assumes the app is mounted at the domain root; GitHub Pages project sites under `/<repository>/` will need a configurable base path before deployment.

There is no template compiler or automatic change detection. A component decides what to render and when to update it. The counter page keeps its DOM and updates only the two text nodes, which is a useful default for forms and interactive widgets too.

## Component pattern

Use the normal custom element lifecycle. Put one-time DOM creation in `connectedCallback()`, subscribe to external state there, and release subscriptions in `disconnectedCallback()`. A component that needs encapsulated styles can attach a shadow root; simple layout elements can stay in light DOM. Both are normal Web Components.

```ts
import { Store } from "../../framework"; // from src/app/components/

const someStore = new Store({ title: "Hello" });

class ExampleCard extends HTMLElement {
  private unsubscribe?: () => void;

  connectedCallback(): void {
    this.innerHTML = `<h2></h2>`;
    this.unsubscribe = someStore.subscribe(({ title }) => {
      this.querySelector("h2")!.textContent = title;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }
}

customElements.define("example-card", ExampleCard);
```

Use `textContent` for dynamic text. Treat strings passed to `innerHTML` as markup, not as a safe way to display user-provided values.

## Structure

- `src/framework/` contains the reusable router and store. Import them from `src/framework/index.ts`.
- `src/app/` contains this demo site's root, route table, state, and custom elements.
- `src/app/routes.ts` is the place to register page elements and map URL paths to them.
- `src/app/components/pages/` contains route-level page elements; shared site chrome such as the navbar lives in `src/app/components/`.
- `src/app/main.ts` is the Vite entry point for the demo site.

This boundary is ready for a larger demo without making the framework responsible for the site's content. For a blog, add post data under `src/app/data/`, then add blog list/detail page elements and routes under `src/app/`. Route parameters are not implemented yet; choose the blog URLs first, then add only the matching support the router needs.

## Direction

The useful core is likely to stay small: custom-element lifecycle conventions, a router, a typed store, and examples. Keep ordinary HTML as the composition layer, use `<template>` and `<slot>` when they solve a real reuse or composition need, and avoid adding a virtual DOM, decorators, dependency injection, or a custom template syntax without a clear use case. Those features would add a second component model on top of the browser's.

Good next steps are a blog example that exercises list/detail pages and real data, plus router coverage for nested paths, query strings, hash links, and history. More advanced options such as lazy-loaded elements can wait until an app needs them.
