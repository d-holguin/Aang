class NotFoundPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    const root = this.shadowRoot;
    if (!root) return;

    root.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1rem;
          max-width: 40rem;
          margin: 2rem auto;
          font-family: system-ui, sans-serif;
          color: #333;
        }
        a { color: #4A90E2; }
      </style>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <a href="/" data-link>Return home</a>
    `;
  }
}

if (!customElements.get("not-found-page")) customElements.define("not-found-page", NotFoundPage);
