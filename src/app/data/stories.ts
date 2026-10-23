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
  body: string[];
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
    body: [
      "At first, the wind was only a number on the forecast. Then it became the low note in the tent fabric, the direction a stand of grass leaned, and the reason a line of clouds gathered over the ridge before noon.",
      "For seven days we walked the open country with no destination more precise than the next sheltered place. We learned to pause at saddles and wait for the gusts to pass. The landscape made its own schedule, and our small one had to fit inside it.",
      "I came home with fewer photographs than I expected and a better sense of scale. The wind was never scenery. It was the thing that joined every part of the view together.",
    ],
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
    body: [
      "The first thing you notice about the Lantern Kitchen is the table. It was built from two mismatched doors and stretches almost the length of the room. By six o'clock every Thursday, there is barely an empty chair.",
      "Nobody asks what you can contribute before handing you a knife or a bowl. Some people bring vegetables, some bring stories, and some arrive tired and leave with a container for tomorrow. The work is simple enough to share: chop, stir, set the table, wash up.",
      "The kitchen is not a solution to every hard thing in the neighborhood. It is a place where people can notice one another. That turns out to be a practical kind of beginning.",
    ],
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
    body: [
      "In Sora Bell's studio, the shelves hold bowls with hairline cracks, a teapot with a newly fitted handle, and one cup joined in three places with a dark glaze. Nothing is hidden. Every repair is part of the object's biography.",
      "Sora works slowly, testing the weight of each piece before deciding where it needs support. The fix is not a return to the moment before something broke. It is a new arrangement that admits what happened and makes room for what comes next.",
      "People bring her objects they cannot replace: a chipped serving dish from an aunt, a mug from a first apartment. She sends them home useful again, with their histories still visible.",
    ],
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
    body: [
      "The river used to run straight here. A century of timber work and flood control pushed it into a narrow channel, fast enough to carry sediment away and leave the banks bare. The restoration crew began by removing the straight lines.",
      "They placed fallen trunks along the bank and reopened an old side channel. The changes looked modest from the road. Down at the water, a quiet pool formed behind the first log, and minnows gathered where there had been only current.",
      "The crew will measure what changes over several seasons. For now, they are watching for signs that the river has started doing some of the work itself.",
    ],
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
    body: [
      "The cart fits through a standard doorway and carries a surprisingly complete workshop: screwdrivers, a soldering iron, spare buttons, bicycle patches, and a small box of parts nobody can identify until the right moment.",
      "Every Saturday it parks outside the market. Residents bring lamps, radios, backpacks, and toys. Some fixes take minutes; others become a lesson, with the owner holding the flashlight while a volunteer explains what failed.",
      "By the end of the month, the cart had kept forty objects in use. Its larger effect is harder to count: people now ask whether something can be repaired before asking where to buy another.",
    ],
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
    body: [
      "I had planned to photograph the old orchard before sunrise, the creek before lunch, and the northern trail in the late light. By ten, I had taken twelve nearly identical pictures of a stone wall.",
      "So I put the camera away and sat down. A beetle crossed one of the stones. The light moved from the tops of the trees to the moss at my feet. What had seemed like a delay became the whole morning.",
      "The photographs I kept were not the ones on my list. They were details I would have walked past while hurrying toward the next view.",
    ],
  },
];

export const featuredStory = stories.find((story) => story.featured) ?? stories[0];

export function findStory(slug: string): Story | undefined {
  return stories.find((story) => story.slug === slug);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}
