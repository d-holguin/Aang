class AboutPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1rem;
          background: #FFF8E7;
          color: #333;
          border-radius: 1rem;
          max-width: 400px;
          margin: 2rem auto;
          font-family: system-ui, sans-serif;
        }

        h2 {
          color: #4A90E2;
        }
      </style>

      <h2>About Aang</h2>
      <p>Aang is a tiny web "framework" built with native Web Components.</p>
    `;
    }
}

customElements.define("about-page", AboutPage);
