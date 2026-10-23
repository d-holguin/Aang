import { findStory, findStoryMarkdown, formatDate } from "../../../data/stories";
import { appStore, toggleSavedStory } from "../../../store";
import { routeHref } from "../../../base-path";
import markup from "./story-page.html?raw";
import styles from "./story-page.css?inline";
import "../../story-grid";

const template = document.createElement("template");
template.innerHTML = `<style>${styles}</style>${markup}`;

class StoryPage extends HTMLElement {
  private readonly root: ShadowRoot;
  private unsubscribe?: () => void;
  private renderSequence = 0;
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
    this.renderSequence += 1;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  private render(): void {
    const renderId = ++this.renderSequence;
    const story = findStory(this.getAttribute("slug") ?? "");
    const content = template.content.cloneNode(true) as DocumentFragment;
    const missing = content.querySelector<HTMLElement>(".missing")!;
    const article = content.querySelector<HTMLElement>(".page")!;

    if (!story) {
      document.title = "Story not found - The Windward";
      missing.hidden = false;
      missing.querySelector<HTMLAnchorElement>("a")!.href = routeHref("/");
      this.root.replaceChildren(content);
      return;
    }

    document.title = `${story.title} - The Windward`;
    article.hidden = false;
    article.querySelector<HTMLAnchorElement>(".back")!.href = routeHref("/");
    article.querySelector(".category")!.textContent = story.category;
    article.querySelector("h1")!.textContent = story.title;
    article.querySelector(".dek")!.textContent = story.excerpt;
    article.querySelector(".author")!.textContent = story.author;

    const date = article.querySelector<HTMLTimeElement>("time")!;
    date.dateTime = story.publishedAt;
    date.textContent = formatDate(story.publishedAt);
    article.querySelector(".read-time")!.textContent = `${story.readMinutes} min read`;
    article.querySelector<HTMLElement>(".art")!.dataset.cover = story.cover;
    article.querySelector(".symbol")!.textContent = story.cover === "sky" ? "∿" : story.cover === "clay" ? "◌" : story.cover === "moss" ? "⌁" : "☼";

    const prose = article.querySelector<HTMLElement>(".prose")!;
    article.querySelector<HTMLButtonElement>(".save")!.addEventListener("click", () => toggleSavedStory(story.slug));
    this.root.replaceChildren(content);
    void this.renderMarkdown(story.slug, prose, renderId);
    this.updateSaveButton();
  }

  private async renderMarkdown(slug: string, prose: HTMLElement, renderId: number): Promise<void> {
    const [markdown, { marked }] = await Promise.all([findStoryMarkdown(slug), import("marked")]);
    if (renderId !== this.renderSequence || !prose.isConnected) return;
    if (!markdown) {
      prose.textContent = "This story is missing its Markdown content.";
      return;
    }
    prose.innerHTML = marked.parse(markdown, { async: false });
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
