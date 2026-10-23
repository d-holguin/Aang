import { Router } from "./router";
import "../components/pages/home-page";
import "../components/pages/about-page";
import "../components/navbar";

class AppRoot extends HTMLElement {
  private router?: Router;

  connectedCallback(): void {
    if (this.router) return;
    this.render();
    this.router = new Router(
      {
        "/": "home-page",
        "/about": "about-page",
      },
      this,
    );
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
      </style>
      <app-navbar></app-navbar>
      <main id="view"></main>
    `;
  }
}

if (!customElements.get("app-root")) customElements.define("app-root", AppRoot);
