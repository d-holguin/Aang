import { Router } from "../framework";
import { appBasePath } from "./base-path";
import { routes } from "./routes";

class AppRoot extends HTMLElement {
  private router?: Router;

  connectedCallback(): void {
    if (this.router) return;
    this.render();
    this.router = new Router(routes, this, { basePath: appBasePath });
  }

  disconnectedCallback(): void {
    this.router?.destroy();
    this.router = undefined;
  }

  /** Navigate to an app route path, such as `/stories/example`. */
  navigate(path: string): void {
    this.router?.navigate(path);
  }

  private render(): void {
    this.innerHTML = `
      <style>
        #view {
          min-height: 1px;
          opacity: 1;
          transition: opacity var(--aang-transition-duration, 150ms) ease-in-out;
        }
        #view.fade-out { opacity: 0; }
        @media (prefers-reduced-motion: reduce) {
          #view { transition: none; }
        }
      </style>
      <site-header></site-header>
      <main id="view" tabindex="-1" aria-live="polite"></main>
    `;
  }
}

if (!customElements.get("app-root")) customElements.define("app-root", AppRoot);
