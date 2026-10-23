import { routeHref } from "../../base-path";

class NotFoundPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    document.title = "Page not found — The Windward";
    const root = this.shadowRoot;
    if (!root) return;
    root.innerHTML = `
      <style>
        :host { display: block; color: #203a35; }
        .page { width: min(720px, calc(100% - 3rem)); min-height: 65vh; margin: auto; padding: 5rem 0; }
        .eyebrow { color: #a76548; font: 700 .68rem system-ui, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        h1 { margin: 1rem 0; font: 400 clamp(3rem, 7vw, 5rem)/1 Georgia, serif; letter-spacing: -.05em; }
        p { color: #65736b; font: 400 1rem/1.65 system-ui, sans-serif; }
        a { display: inline-flex; margin-top: 1rem; color: #a34f35; font: 700 .85rem system-ui, sans-serif; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
      <section class="page">
        <p class="eyebrow">A quiet wrong turn</p>
        <h1>This page drifted away.</h1>
        <p>We couldn’t find that story. The journal is still right where you left it.</p>
        <a href="${routeHref("/")}" data-link>Back to the stories <span aria-hidden="true">→</span></a>
      </section>
    `;
  }
}

if (!customElements.get("not-found-page")) customElements.define("not-found-page", NotFoundPage);
