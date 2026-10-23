export const categories = ["All", "Field notes", "Craft", "Culture", "Wild places"] as const;

export type StoryCategory = (typeof categories)[number];
export type CoverStyle = "sky" | "clay" | "moss" | "sunset";

export interface Story {
  slug: string;
  title: string;
  category: Exclude<StoryCategory, "All">;
  excerpt: string;
  author: string;
  publishedAt: string;
  readMinutes: number;
  cover: CoverStyle;
  featured?: boolean;
}

export const stories: Story[] = [
  {
    slug: "listening-to-the-wind",
    title: "Listening to the wind",
    category: "Field notes",
    excerpt: "A week on the high plateau taught me that the weather has a language of its own.",
    author: "Mira Chen",
    publishedAt: "2025-06-18",
    readMinutes: 7,
    cover: "sky",
    featured: true,
  },
  {
    slug: "a-table-for-everyone",
    title: "A table for everyone",
    category: "Culture",
    excerpt: "Inside the neighborhood kitchen that turns a weekly meal into a shared ritual.",
    author: "Jonah Reyes",
    publishedAt: "2025-06-12",
    readMinutes: 5,
    cover: "clay",
  },
  {
    slug: "the-patient-art-of-repair",
    title: "The patient art of repair",
    category: "Craft",
    excerpt: "A ceramicist on why a visible seam can tell a truer story than a perfect surface.",
    author: "Leila Okafor",
    publishedAt: "2025-06-04",
    readMinutes: 6,
    cover: "sunset",
  },
  {
    slug: "where-the-river-bends",
    title: "Where the river bends",
    category: "Wild places",
    excerpt: "Following a restoration crew as they make room for a river to find its old shape.",
    author: "Theo Park",
    publishedAt: "2025-05-27",
    readMinutes: 8,
    cover: "moss",
  },
  {
    slug: "small-tools-big-change",
    title: "Small tools, big change",
    category: "Craft",
    excerpt: "A traveling repair cart is helping a town rethink what it means to throw something away.",
    author: "Mira Chen",
    publishedAt: "2025-05-19",
    readMinutes: 4,
    cover: "sky",
  },
  {
    slug: "the-shape-of-a-slower-day",
    title: "The shape of a slower day",
    category: "Field notes",
    excerpt: "A photographer leaves the checklist behind and finds a different way to pay attention.",
    author: "Jonah Reyes",
    publishedAt: "2025-05-08",
    readMinutes: 5,
    cover: "clay",
  },
];

export const featuredStory = stories.find((story) => story.featured) ?? stories[0];

export function findStory(slug: string): Story | undefined {
  return stories.find((story) => story.slug === slug);
}

export function findStoryMarkdown(slug: string): Promise<string | undefined> {
  return storyMarkdown[`../content/stories/${slug}.md`]?.();
}

const storyMarkdown = import.meta.glob<string>("../content/stories/*.md", {
  query: "?raw",
  import: "default",
});

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}
