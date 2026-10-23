import { categories, stories, type Story, type StoryCategory } from "../data/stories";
import { appStore } from "../store";
import "./story-card/story-card";

class StoryGrid extends HTMLElement {
  private readonly root: ShadowRoot;
  private unsubscribe?: () => void;
  private searchTerm = "";
  private selectedCategory: StoryCategory = "All";
  private get savedOnly(): boolean {
    return this.hasAttribute("saved-only");
  }
  private get excludedSlug(): string | null {
    return this.getAttribute("exclude-slug");
  }

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.renderShell();
    this.root.querySelector<HTMLInputElement>("input")?.addEventListener("input", (event) => {
      this.searchTerm = (event.currentTarget as HTMLInputElement).value.trim().toLowerCase();
      this.renderStories();
    });
    this.unsubscribe = appStore.subscribe(() => this.renderStories());
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  private renderShell(): void {
    this.root.innerHTML = `
      <style>
        :host { display: block; }
        .tools { display: grid; gap: 1.2rem; margin: 0 0 2rem; }
        .search-row { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
        label { display: grid; gap: .45rem; color: #53615b; font: 600 .76rem system-ui, sans-serif; }
        input {
          width: min(100%, 25rem);
          border: 1px solid #d9ded7;
          border-radius: .65rem;
          padding: .8rem .95rem;
          background: #fffefa;
          color: #203a35;
          font: 400 .95rem system-ui, sans-serif;
        }
        input:focus-visible, button:focus-visible { outline: 3px solid #8bb5a5; outline-offset: 3px; }
        .result-count { color: #76817c; font: 400 .82rem system-ui, sans-serif; }
        .categories { display: flex; flex-wrap: wrap; gap: .5rem; }
        .categories[hidden] { display: none; }
        .categories button {
          border: 1px solid #d9ded7;
          border-radius: 99px;
          padding: .48rem .82rem;
          background: transparent;
          color: #53615b;
          font: 600 .78rem system-ui, sans-serif;
          cursor: pointer;
        }
        .categories button[aria-pressed="true"] { border-color: #203a35; background: #203a35; color: #fffefa; }
        .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; }
        .empty { grid-column: 1 / -1; padding: 3rem 1rem; text-align: center; border: 1px dashed #c9d2c9; border-radius: 1rem; color: #53615b; }
        .empty h3 { margin: 0 0 .4rem; color: #203a35; font: 500 1.5rem Georgia, serif; }
        .empty p { margin: 0; font: 400 .9rem/1.5 system-ui, sans-serif; }
        @media (max-width: 820px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) {
          .search-row { align-items: start; flex-direction: column; }
          .grid { grid-template-columns: 1fr; }
        }
      </style>
      <div class="tools">
        <div class="search-row">
          <label>Search stories<input type="search" placeholder="Try ‘river’ or ‘repair’" autocomplete="off" /></label>
          <span class="result-count" aria-live="polite"></span>
        </div>
        <div class="categories" role="group" aria-label="Filter by topic"></div>
      </div>
      <div class="grid"></div>
    `;

    const categoryGroup = this.root.querySelector<HTMLElement>(".categories")!;
    if (this.savedOnly) categoryGroup.hidden = true;
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = category;
      button.setAttribute("aria-pressed", String(category === this.selectedCategory));
      button.addEventListener("click", () => {
        this.selectedCategory = category;
        categoryGroup.querySelectorAll("button").forEach((item) => {
          item.setAttribute("aria-pressed", String(item === button));
        });
        this.renderStories();
      });
      categoryGroup.append(button);
    });
    if (this.savedOnly) this.root.querySelector<HTMLInputElement>("input")!.placeholder = "Search your reading list";
  }

  private renderStories(): void {
    const savedSlugs = appStore.getState().savedSlugs;
    const visibleStories = stories.filter((story) => {
      if (story.slug === this.excludedSlug) return false;
      if (this.savedOnly && !savedSlugs.includes(story.slug)) return false;
      if (this.selectedCategory !== "All" && story.category !== this.selectedCategory) return false;
      const text = `${story.title} ${story.excerpt} ${story.category} ${story.author}`.toLowerCase();
      return text.includes(this.searchTerm);
    });

    const count = this.root.querySelector<HTMLElement>(".result-count");
    if (count) count.textContent = `${visibleStories.length} ${visibleStories.length === 1 ? "story" : "stories"}`;

    const grid = this.root.querySelector<HTMLElement>(".grid");
    if (!grid) return;
    grid.replaceChildren();

    if (visibleStories.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      const heading = document.createElement("h3");
      heading.textContent = this.savedOnly ? "Your reading list is clear" : "No stories found";
      const message = document.createElement("p");
      message.textContent = this.savedOnly
        ? "Save a story with the + Save button and it will be here next time."
        : "Try another search or choose a different topic.";
      empty.append(heading, message);
      grid.append(empty);
      return;
    }

    visibleStories.forEach((story) => {
      const card = document.createElement("story-card") as HTMLElement & { story: Story };
      card.story = story;
      grid.append(card);
    });
  }
}

if (!customElements.get("story-grid")) customElements.define("story-grid", StoryGrid);
