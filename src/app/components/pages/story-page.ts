import { findStory, formatDate } from "../../data/stories";
import { appStore, toggleSavedStory } from "../../store";
import "../story-grid";
import { routeHref } from "../../base-path";

class StoryPage extends HTMLElement {
  private readonly root: ShadowRoot;
  private unsubscribe?: () => void;
  static get observedAttributes(): string[] { return ["slug"]; }

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.unsubscribe = appStore.subscribe(() => this.updateSaveButton());
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  private render(): void {
    const story = findStory(this.getAttribute("slug") ?? "");
    if (!story) {
      document.title = "Story not found — The Windward";
      this.root.innerHTML = `
        <style>
          :host { display: block; color: #203a35; }
          .missing { width: min(720px, calc(100% - 3rem)); min-height: 55vh; margin: auto; padding: 5rem 0; }
          h1 { margin: 0 0 .8rem; font: 400 3rem Georgia, serif; }
          p { color: #65736b; font: 400 1rem/1.6 system-ui, sans-serif; }
          a { color: #a34f35; }
        </style>
        <section class="missing"><h1>Story not found</h1><p>That story may have moved. There are plenty more in the journal.</p><a href="${routeHref("/")}" data-link>Browse all stories →</a></section>
      `;
      return;
    }

    document.title = `${story.title} — The Windward`;
    this.root.innerHTML = `
      <style>
        :host { display: block; color: #203a35; }
        .page { width: min(1120px, calc(100% - 3rem)); margin: auto; padding: 2rem 0 5rem; }
        .back { display: inline-flex; gap: .5rem; align-items: center; margin: 0 0 2rem; color: #69766f; font: 600 .8rem system-ui, sans-serif; text-decoration: none; }
        .back:hover { color: #bd613f; }
        .article { max-width: 760px; margin: 0 auto; }
        .category { margin: 0 0 .8rem; color: #a76548; font: 700 .68rem system-ui, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        h1 { margin: 0; font: 400 clamp(2.8rem, 7vw, 5.2rem)/.98 Georgia, serif; letter-spacing: -.055em; }
        .dek { max-width: 650px; margin: 1.3rem 0; color: #65736b; font: 400 clamp(1.05rem, 2vw, 1.25rem)/1.65 system-ui, sans-serif; }
        .byline { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin: 1.3rem 0 1.8rem; color: #7c8780; font: 600 .75rem system-ui, sans-serif; }
        .save { border: 1px solid #cbd4cc; border-radius: 99px; padding: .58rem .9rem; background: #fffefa; color: #52645c; font: 600 .78rem system-ui, sans-serif; cursor: pointer; }
        .save[aria-pressed="true"] { border-color: #bd613f; color: #a34f35; }
        figure { position: relative; display: grid; min-height: 390px; overflow: hidden; margin: 0 0 2.5rem; border-radius: 1rem; place-items: center; }
        .art { position: absolute; inset: 0; }
        .art[data-cover="sky"] { background: radial-gradient(circle at 50% 50%, #e4f0e5 0 12%, transparent 12.5%), radial-gradient(ellipse at 50% 50%, #bdd5c8, #7da593); }
        .art[data-cover="clay"] { background: radial-gradient(circle at 50% 50%, #f5e2c7 0 12%, transparent 12.5%), radial-gradient(ellipse at 50% 50%, #e3b78d, #bd7857); }
        .art[data-cover="moss"] { background: radial-gradient(circle at 50% 50%, #e4e8cd 0 12%, transparent 12.5%), radial-gradient(ellipse at 50% 50%, #b7c39a, #75865f); }
        .art[data-cover="sunset"] { background: radial-gradient(circle at 50% 50%, #f9dec0 0 12%, transparent 12.5%), radial-gradient(ellipse at 50% 50%, #e9aa83, #c66b5f); }
        .art::before, .art::after { position: absolute; top: 50%; left: 50%; border: 1px solid #fff9; border-radius: 50%; content: ""; transform: translate(-50%, -50%); }
        .art::before { width: min(60vw, 480px); aspect-ratio: 1; }
        .art::after { width: min(42vw, 330px); aspect-ratio: 1; }
        .symbol { z-index: 1; color: #fffefa; font: 300 10rem Georgia, serif; opacity: .9; }
        figcaption { position: absolute; right: 1.2rem; bottom: 1rem; color: white; font: 700 .65rem system-ui, sans-serif; letter-spacing: .1em; text-transform: uppercase; }
        .prose { max-width: 650px; margin: auto; }
        .prose p { margin: 0 0 1.45rem; color: #374b43; font: 400 1.08rem/1.9 Georgia, serif; }
        .endmark { margin: 2.2rem 0 3.5rem; color: #bd7857; text-align: center; font: 2rem Georgia, serif; }
        .more { padding-top: 2rem; border-top: 1px solid #e5e2d9; }
        .more h2 { margin: 0 0 1.5rem; font: 400 2rem Georgia, serif; }
        @media (max-width: 600px) { .page { width: calc(100% - 2rem); padding-top: 1.3rem; } figure { min-height: 260px; } .symbol { font-size: 7rem; } }
      </style>
      <article class="page">
        <a class="back" href="${routeHref("/")}" data-link><span aria-hidden="true">←</span> All stories</a>
        <header class="article">
          <p class="category"></p>
          <h1></h1>
          <p class="dek"></p>
          <div class="byline"><span class="author"></span><span aria-hidden="true">·</span><time></time><span aria-hidden="true">·</span><span class="read-time"></span><span style="flex:1"></span><button class="save" type="button"></button></div>
        </header>
        <figure><div class="art" aria-hidden="true"></div><span class="symbol" aria-hidden="true"></span><figcaption>The Windward · Field journal</figcaption></figure>
        <div class="prose"></div>
        <div class="endmark" aria-hidden="true">✳</div>
        <section class="more" aria-labelledby="more-title"><h2 id="more-title">A few more good reads</h2><story-grid></story-grid></section>
      </article>
    `;

    this.root.querySelector(".category")!.textContent = story.category;
    this.root.querySelector("h1")!.textContent = story.title;
    this.root.querySelector(".dek")!.textContent = story.excerpt;
    this.root.querySelector(".author")!.textContent = story.author;
    const date = this.root.querySelector<HTMLTimeElement>("time")!;
    date.dateTime = story.publishedAt;
    date.textContent = formatDate(story.publishedAt);
    this.root.querySelector(".read-time")!.textContent = `${story.readMinutes} min read`;
    this.root.querySelector<HTMLElement>(".art")!.dataset.cover = story.cover;
    this.root.querySelector(".symbol")!.textContent = story.cover === "sky" ? "∿" : story.cover === "clay" ? "◌" : story.cover === "moss" ? "⌁" : "☼";
    const prose = this.root.querySelector<HTMLElement>(".prose")!;
    story.body.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      prose.append(paragraph);
    });
    this.root.querySelector<HTMLButtonElement>(".save")!.addEventListener("click", () => toggleSavedStory(story.slug));
    this.updateSaveButton();
  }

  private updateSaveButton(): void {
    const button = this.root.querySelector<HTMLButtonElement>(".save");
    if (!button) return;
    const story = findStory(this.getAttribute("slug") ?? "");
    if (!story) return;
    const saved = appStore.getState().savedSlugs.includes(story.slug);
    button.textContent = saved ? "Saved ✓" : "＋ Save for later";
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", `${saved ? "Remove from" : "Save to"} reading list: ${story.title}`);
  }
}

if (!customElements.get("story-page")) customElements.define("story-page", StoryPage);
