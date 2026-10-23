import { Store } from "../framework";

const savedStoriesKey = "aang.saved-stories";

export interface AppState {
  savedSlugs: string[];
}

function readSavedSlugs(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(savedStoriesKey) ?? "[]");
    return Array.isArray(value) ? value.filter((slug): slug is string => typeof slug === "string") : [];
  } catch {
    return [];
  }
}

export const appStore = new Store<AppState>({ savedSlugs: readSavedSlugs() });

appStore.subscribe(({ savedSlugs }) => {
  try {
    window.localStorage.setItem(savedStoriesKey, JSON.stringify(savedSlugs));
  } catch {
    // Saving is a convenience; the reading list still works for this session.
  }
});

export function toggleSavedStory(slug: string): void {
  appStore.update((state) => ({
    savedSlugs: state.savedSlugs.includes(slug)
      ? state.savedSlugs.filter((savedSlug) => savedSlug !== slug)
      : [...state.savedSlugs, slug],
  }));
}
