import "./components/pages/home-page";
import "./components/pages/about-page";
import "./components/pages/not-found-page";
import "./components/navbar";

// Keep route and element registration together so adding app pages stays local.
export const routes = {
  "/": "home-page",
  "/about": "about-page",
  "/404": "not-found-page",
};
