import "../story-grid";

class SavedPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    document.title = "Your reading list — The Windward";
    const root = this.shadowRoot;
    if (!root) return;
    root.innerHTML = `
      <style>
        :host { display: block; color: #203a35; }
        .page { width: min(1120px, calc(100% - 3rem)); margin: auto; padding: 3.2rem 0 5rem; }
        .eyebrow { margin: 0 0 .65rem; color: #a76548; font: 700 .68rem system-ui, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        h1 { margin: 0; font: 400 clamp(2.8rem, 6vw, 4.4rem)/1 Georgia, serif; letter-spacing: -.05em; }
        .lede { max-width: 36rem; margin: .85rem 0 2.6rem; color: #65736b; font: 400 1rem/1.65 system-ui, sans-serif; }
        @media (max-width: 600px) { .page { width: calc(100% - 2rem); padding-top: 2.2rem; } }
      </style>
      <section class="page" aria-labelledby="saved-title">
        <p class="eyebrow">Keep close</p>
        <h1 id="saved-title">Your reading list</h1>
        <p class="lede">Stories you’ve saved for a quieter moment. Your list stays on this device.</p>
        <story-grid saved-only></story-grid>
      </section>
    `;
  }
}

if (!customElements.get("saved-page")) customElements.define("saved-page", SavedPage);
