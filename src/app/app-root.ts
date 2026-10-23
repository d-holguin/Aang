import { Router } from "../framework/router";
import { routes } from "./routes";

class AppRoot extends HTMLElement {
  private router?: Router;

  connectedCallback(): void {
    if (this.router) return;
    this.render();
    this.router = new Router(routes, this);
  }

  disconnectedCallback(): void {
    this.router?.destroy();
    this.router = undefined;
  }

  private render(): void {
    this.innerHTML = `
      <style>
        #view {
          min-height: 1px;
          opacity: 1;
          transition: opacity 0.15s ease-in-out;
        }
        #view.fade-out { opacity: 0; }
        @media (prefers-reduced-motion: reduce) {
          #view { transition: none; }
        }
      </style>
      <app-navbar></app-navbar>
      <main id="view" aria-live="polite"></main>
    `;
  }
}

if (!customElements.get("app-root")) customElements.define("app-root", AppRoot);
