import { formatDate, type Story } from "../../data/stories";
import { appStore, toggleSavedStory } from "../../store";
import { routeHref } from "../../base-path";
import markup from "./story-card.html?raw";
import styles from "./story-card.css?inline";

const template = document.createElement("template");
template.innerHTML = `<style>${styles}</style>${markup}`;

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

    this.root.replaceChildren(template.content.cloneNode(true));

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
