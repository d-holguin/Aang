class AboutPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    document.title = "About — The Windward";
    const root = this.shadowRoot;
    if (!root) return;
    root.innerHTML = `
      <style>
        :host { display: block; color: #203a35; }
        .page { width: min(760px, calc(100% - 3rem)); min-height: 65vh; margin: auto; padding: 4rem 0 5rem; }
        .eyebrow { margin: 0 0 .8rem; color: #a76548; font: 700 .68rem system-ui, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        h1 { max-width: 650px; margin: 0; font: 400 clamp(2.7rem, 6vw, 4.7rem)/1 Georgia, serif; letter-spacing: -.05em; }
        .lead { margin: 1.4rem 0 2.4rem; color: #65736b; font: 400 1.15rem/1.75 system-ui, sans-serif; }
        .copy { padding-top: 1.7rem; border-top: 1px solid #e5e2d9; }
        .copy p { color: #41554c; font: 400 1.02rem/1.85 Georgia, serif; }
        .note { display: flex; gap: 1rem; align-items: start; margin-top: 2rem; padding: 1.15rem; border-radius: .9rem; background: #e8eee6; color: #56655d; font: 400 .85rem/1.55 system-ui, sans-serif; }
        .note strong { color: #203a35; }
        @media (max-width: 600px) { .page { width: calc(100% - 2rem); padding-top: 2.5rem; } }
      </style>
      <article class="page">
        <p class="eyebrow">Why we’re here</p>
        <h1>Attention is a way of caring.</h1>
        <p class="lead">The Windward is an independent journal about thoughtful work, wild places, and the people who make room for one another.</p>
        <div class="copy">
          <p>We believe a good story can make a distant concern feel close enough to act on. We publish reported pieces, field notes, and conversations that leave space for complexity without losing sight of hope.</p>
          <p>Every story here is fictional and written for this demo. The site is also a working example of Aang: a few typed utilities built on standard HTML custom elements, with no template compiler or virtual DOM.</p>
          <div class="note"><span aria-hidden="true">✳</span><span><strong>Take your time.</strong> Save stories to your reading list and come back whenever you like. Your saved list stays in this browser.</span></div>
        </div>
      </article>
    `;
  }
}

if (!customElements.get("about-page")) customElements.define("about-page", AboutPage);
