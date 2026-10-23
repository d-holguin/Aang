import "./components/pages/home-page";
import "./components/pages/about-page";
import "./components/pages/not-found-page";
import "./components/pages/saved-page";
import "./components/pages/story-page/story-page";
import "./components/site-header";
import type { RouteTable } from "../framework";

// Keep route and element registration together so adding app pages stays local.
export const routes = {
  "/": "home-page",
  "/stories/:slug": "story-page",
  "/saved": "saved-page",
  "/about": "about-page",
  "/404": "not-found-page",
} satisfies RouteTable;
