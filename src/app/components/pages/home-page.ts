import { featuredStory, formatDate } from "../../data/stories";
import { toggleSavedStory, appStore } from "../../store";
import { routeHref } from "../../base-path";
import "../story-card";
import "../story-grid";

class HomePage extends HTMLElement {
  private readonly root: ShadowRoot;
  private unsubscribe?: () => void;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    document.title = "Stories for a more attentive world — The Windward";
    this.root.innerHTML = `
      <style>
        :host { display: block; color: #203a35; }
        .page { width: min(1120px, calc(100% - 3rem)); margin: auto; padding: 2.6rem 0 5rem; }
        .intro { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin: .3rem 0 2.4rem; }
        .eyebrow { margin: 0 0 .8rem; color: #a76548; font: 700 .68rem system-ui, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        h1 { max-width: 690px; margin: 0; font: 400 clamp(2.8rem, 6vw, 5.15rem)/.98 Georgia, serif; letter-spacing: -.055em; }
        .intro-copy { max-width: 290px; margin: 0 0 .25rem; color: #65736b; font: 400 .96rem/1.65 system-ui, sans-serif; }
        .feature { display: grid; grid-template-columns: 1.05fr .95fr; min-height: 390px; overflow: hidden; margin-bottom: 4.1rem; border-radius: 1.2rem; background: #e7ede4; }
        .feature-copy { display: flex; flex-direction: column; align-items: start; justify-content: center; padding: clamp(1.5rem, 4vw, 3.5rem); }
        .feature-label { display: inline-flex; align-items: center; gap: .55rem; margin: 0 0 1.1rem; color: #65736b; font: 700 .66rem system-ui, sans-serif; letter-spacing: .13em; text-transform: uppercase; }
        .feature-label::before { width: 1.45rem; height: 1px; background: #bd613f; content: ""; }
        .feature h2 { max-width: 450px; margin: 0 0 1rem; font: 400 clamp(2.3rem, 4.4vw, 3.8rem)/1 Georgia, serif; letter-spacing: -.045em; }
        .feature-excerpt { max-width: 390px; margin: 0; color: #56655d; font: 400 1rem/1.7 system-ui, sans-serif; }
        .feature-meta { margin: 1.25rem 0 1.5rem; color: #79847d; font: 600 .72rem system-ui, sans-serif; }
        .feature-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1.2rem; }
        .read-link { display: inline-flex; align-items: center; gap: .55rem; color: #203a35; font: 700 .82rem system-ui, sans-serif; text-decoration: none; }
        .read-link:hover { color: #bd613f; }
        .save-feature { border: 1px solid #bfcbbf; border-radius: 99px; padding: .55rem .85rem; background: transparent; color: #52645c; font: 600 .75rem system-ui, sans-serif; cursor: pointer; }
        .save-feature[aria-pressed="true"] { border-color: #bd613f; color: #a34f35; }
        .feature-art { position: relative; display: grid; min-height: 320px; overflow: hidden; place-items: center; background: radial-gradient(ellipse at 50% 52%, #c9dfd3 0 15%, transparent 15.5%), linear-gradient(145deg, #9db9a9, #d5c6a7); }
        .feature-art::before { position: absolute; width: 370px; height: 370px; border: 1px solid #fff9; border-radius: 50%; content: ""; }
        .feature-art::after { position: absolute; width: 270px; height: 270px; border: 1px solid #fff9; border-radius: 50%; content: ""; }
        .wind-mark { z-index: 1; color: #fffefa; font: 300 9rem/.8 Georgia, serif; transform: rotate(-15deg); opacity: .9; }
        .art-caption { position: absolute; right: 1.35rem; bottom: 1.2rem; color: #fffefa; font: 600 .63rem system-ui, sans-serif; letter-spacing: .1em; text-transform: uppercase; }
        .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin: 0 0 1.4rem; }
        .section-heading h2 { margin: 0; font: 400 2.2rem/1 Georgia, serif; letter-spacing: -.035em; }
        .section-heading p { margin: 0; color: #7a847e; font: 400 .82rem system-ui, sans-serif; }
        @media (max-width: 760px) {
          .page { width: min(100% - 2rem, 600px); padding-top: 2rem; }
          .intro { display: block; margin-bottom: 1.7rem; }
          .intro-copy { max-width: 470px; margin-top: 1rem; }
          .feature { grid-template-columns: 1fr; }
          .feature-copy { order: 2; }
          .feature-art { min-height: 250px; }
        }
        @media (max-width: 480px) {
          .section-heading { display: block; }
          .section-heading p { margin-top: .5rem; }
          .feature-art { min-height: 210px; }
        }
        @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
      </style>
      <div class="page">
        <section class="intro" aria-labelledby="page-title">
          <div><p class="eyebrow">Stories for a more attentive world</p><h1 id="page-title">A little closer<br />to the things that matter.</h1></div>
          <p class="intro-copy">Notes on people, places, and the small acts of care that change how we move through the world.</p>
        </section>
        <article class="feature">
          <div class="feature-copy">
            <p class="feature-label">This week’s field note</p>
            <h2 class="feature-title"></h2>
            <p class="feature-excerpt"></p>
            <p class="feature-meta"></p>
            <div class="feature-actions"><a class="read-link" data-link>Read the story <span aria-hidden="true">→</span></a><button class="save-feature" type="button"></button></div>
          </div>
          <div class="feature-art" aria-hidden="true"><span class="wind-mark">∿</span><span class="art-caption">No. 06 — High country</span></div>
        </article>
        <section aria-labelledby="latest-title">
          <div class="section-heading"><h2 id="latest-title">The latest</h2><p>Good things to spend a few minutes with.</p></div>
          <story-grid></story-grid>
        </section>
      </div>
    `;

    const title = this.root.querySelector<HTMLElement>(".feature-title")!;
    title.textContent = featuredStory.title;
    this.root.querySelector("story-grid")?.setAttribute("exclude-slug", featuredStory.slug);
    const link = this.root.querySelector<HTMLAnchorElement>(".read-link")!;
    link.href = routeHref(`/stories/${encodeURIComponent(featuredStory.slug)}`);
    this.root.querySelector(".feature-excerpt")!.textContent = featuredStory.excerpt;
    this.root.querySelector(".feature-meta")!.textContent = `${featuredStory.author} · ${formatDate(featuredStory.publishedAt)} · ${featuredStory.readMinutes} min read`;
    this.root.querySelector<HTMLButtonElement>(".save-feature")!.addEventListener("click", () => toggleSavedStory(featuredStory.slug));
    this.unsubscribe = appStore.subscribe(() => this.updateFeatureSaveButton());
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  private updateFeatureSaveButton(): void {
    const button = this.root.querySelector<HTMLButtonElement>(".save-feature");
    if (!button) return;
    const saved = appStore.getState().savedSlugs.includes(featuredStory.slug);
    button.textContent = saved ? "Saved to reading list ✓" : "＋ Save for later";
    button.setAttribute("aria-pressed", String(saved));
  }
}

if (!customElements.get("home-page")) customElements.define("home-page", HomePage);
