const logoUrl = new URL("../assets/aang-32.png", import.meta.url).href;

class Navbar extends HTMLElement {
  connectedCallback(): void {
    this.innerHTML = `
      <style>
        nav {
          background: #FFF8E7;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        img { width: 24px; height: 24px; vertical-align: middle; }
        a { color: #4A90E2; text-decoration: none; margin: 0 5px; font-weight: 500; }
        a:hover { text-decoration: underline; }
      </style>
      <nav aria-label="Main navigation">
        <img src="${logoUrl}" alt="Aang logo" />
        <a href="/" data-link>Home</a>
        <a href="/about" data-link>About</a>
      </nav>
    `;
  }
}

if (!customElements.get("app-navbar")) customElements.define("app-navbar", Navbar);
