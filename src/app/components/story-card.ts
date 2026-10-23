import { formatDate, type Story } from "../data/stories";
import { appStore, toggleSavedStory } from "../store";
import { routeHref } from "../base-path";

class StoryCard extends HTMLElement {
  private readonly root: ShadowRoot;
  private currentStory?: Story;
  private unsubscribe?: () => void;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  set story(story: Story) {
    this.currentStory = story;
    if (this.isConnected) this.render();
  }

  connectedCallback(): void {
    this.render();
    this.unsubscribe = appStore.subscribe(() => this.updateSaveButton());
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  private render(): void {
    const story = this.currentStory;
    if (!story) return;

    this.root.innerHTML = `
      <style>
        :host { display: block; min-width: 0; }
        article {
          height: 100%;
          overflow: hidden;
          background: #fffefa;
          border: 1px solid #e6e2d8;
          border-radius: 1rem;
          transition: transform 180ms ease, box-shadow 180ms ease;
        }
        article:hover { transform: translateY(-3px); box-shadow: 0 16px 36px #203a3514; }
        .cover {
          position: relative;
          display: grid;
          min-height: 190px;
          overflow: hidden;
          place-items: center;
          isolation: isolate;
        }
        .cover::before, .cover::after { content: ""; position: absolute; border-radius: 50%; z-index: -1; }
        .cover::before { width: 210px; height: 210px; border: 1px solid #ffffff80; }
        .cover::after { width: 140px; height: 140px; border: 1px solid #ffffff80; }
        .cover[data-cover="sky"] { background: radial-gradient(circle at 50% 45%, #d5e9df, #8cb4a5); }
        .cover[data-cover="clay"] { background: radial-gradient(circle at 50% 45%, #f5d7b5, #d4956e); }
        .cover[data-cover="moss"] { background: radial-gradient(circle at 50% 45%, #d5ddbd, #8d9b70); }
        .cover[data-cover="sunset"] { background: radial-gradient(circle at 50% 45%, #f5c89e, #dc866d); }
        .symbol { color: #fffefa; font: 300 4rem/1 Georgia, serif; opacity: .9; }
        .body { padding: 1.15rem 1.2rem 1.2rem; }
        .meta { display: flex; justify-content: space-between; gap: .5rem; color: #6b7771; font: 600 .68rem/1.4 system-ui, sans-serif; letter-spacing: .09em; text-transform: uppercase; }
        h2 { margin: .7rem 0 .5rem; font: 500 1.42rem/1.15 Georgia, serif; letter-spacing: -.025em; }
        h2 a { color: #203a35; text-decoration: none; }
        h2 a:hover { color: #bd613f; }
        p { min-height: 3.3em; margin: 0; color: #53615b; font: 400 .91rem/1.55 system-ui, sans-serif; }
        footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.1rem; color: #76817c; font: 400 .78rem/1.4 system-ui, sans-serif; }
        button { border: 0; padding: .35rem .2rem; background: transparent; color: #52645c; font: 600 .78rem system-ui, sans-serif; cursor: pointer; }
        button:hover, button[aria-pressed="true"] { color: #bd613f; }
        @media (prefers-reduced-motion: reduce) { article { transition: none; } }
      </style>
      <article>
        <div class="cover" aria-hidden="true"><span class="symbol"></span></div>
        <div class="body">
          <div class="meta"><span class="category"></span><span class="date"></span></div>
          <h2><a data-link></a></h2>
          <p class="excerpt"></p>
          <footer><span class="byline"></span><button type="button"></button></footer>
        </div>
      </article>
    `;

    const cover = this.root.querySelector<HTMLElement>(".cover");
    if (cover) cover.dataset.cover = story.cover;
    const symbol = this.root.querySelector<HTMLElement>(".symbol");
    if (symbol) symbol.textContent = story.cover === "sky" ? "∿" : story.cover === "clay" ? "◌" : story.cover === "moss" ? "⌁" : "☼";
    const link = this.root.querySelector<HTMLAnchorElement>("h2 a");
    if (link) {
      link.href = routeHref(`/stories/${encodeURIComponent(story.slug)}`);
      link.textContent = story.title;
    }
    this.root.querySelector(".category")!.textContent = story.category;
    this.root.querySelector(".date")!.textContent = formatDate(story.publishedAt);
    this.root.querySelector(".excerpt")!.textContent = story.excerpt;
    this.root.querySelector(".byline")!.textContent = `${story.author} · ${story.readMinutes} min read`;
    this.root.querySelector("button")!.addEventListener("click", () => toggleSavedStory(story.slug));
    this.updateSaveButton();
  }

  private updateSaveButton(): void {
    const story = this.currentStory;
    const button = this.root.querySelector<HTMLButtonElement>("button");
    if (!story || !button) return;
    const saved = appStore.getState().savedSlugs.includes(story.slug);
    button.textContent = saved ? "Saved ✓" : "＋ Save";
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", `${saved ? "Remove from" : "Save to"} reading list: ${story.title}`);
  }
}

if (!customElements.get("story-card")) customElements.define("story-card", StoryCard);
