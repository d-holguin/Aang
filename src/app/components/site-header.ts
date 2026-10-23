import { appStore } from "../store";
import { routeHref, routePathFromUrl } from "../base-path";

const logoUrl = new URL("../assets/aang-32.png", import.meta.url).href;

class SiteHeader extends HTMLElement {
  private readonly root: ShadowRoot;
  private unsubscribe?: () => void;
  private readonly onNavigate = (): void => this.updateActiveLink();

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.root.innerHTML = `
      <style>
        :host { display: block; }
        header { border-bottom: 1px solid #e9e6dc; background: #f7f6f0eF; }
        .bar { display: flex; align-items: center; justify-content: space-between; gap: 2rem; width: min(1120px, calc(100% - 3rem)); min-height: 82px; margin: auto; }
        .brand { display: inline-flex; align-items: center; gap: .7rem; color: #203a35; text-decoration: none; }
        .brand img { width: 34px; height: 34px; }
        .brand-copy { display: grid; gap: .12rem; }
        .brand-name { font: 500 1.18rem/1 Georgia, serif; letter-spacing: -.025em; }
        .brand-tag { color: #758179; font: 600 .58rem/1.2 system-ui, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        nav { display: flex; align-items: center; gap: 1.8rem; }
        nav a { color: #5c6a63; font: 600 .82rem system-ui, sans-serif; text-decoration: none; transition: color 120ms ease; }
        nav a:hover, nav a[aria-current="page"] { color: #bd613f; }
        .saved { display: inline-flex; align-items: center; gap: .5rem; }
        .badge { display: grid; min-width: 1.25rem; height: 1.25rem; padding: 0 .25rem; place-items: center; border-radius: 99px; background: #e8ede6; color: #345449; font: 700 .65rem system-ui, sans-serif; }
        .badge[hidden] { display: none; }
        @media (max-width: 600px) {
          .bar { width: calc(100% - 2rem); min-height: 72px; gap: 1rem; }
          nav { gap: .95rem; }
          nav a { font-size: .76rem; }
          .brand-tag { display: none; }
          .brand img { width: 30px; height: 30px; }
        }
      </style>
      <header>
        <div class="bar">
          <a class="brand" href="${routeHref("/")}" data-link aria-label="The Windward home">
            <img src="${logoUrl}" alt="" />
            <span class="brand-copy"><span class="brand-name">The Windward</span><span class="brand-tag">An independent journal</span></span>
          </a>
          <nav aria-label="Main navigation">
            <a href="${routeHref("/")}" data-link>Stories</a>
            <a class="saved" href="${routeHref("/saved")}" data-link>Reading list<span class="badge" hidden></span></a>
            <a href="${routeHref("/about")}" data-link>About</a>
          </nav>
        </div>
      </header>
    `;
    this.unsubscribe = appStore.subscribe(({ savedSlugs }) => {
      const badge = this.root.querySelector<HTMLElement>(".badge");
      if (!badge) return;
      badge.textContent = String(savedSlugs.length);
      badge.hidden = savedSlugs.length === 0;
    });
    window.addEventListener("aang:navigate", this.onNavigate);
    this.updateActiveLink();
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    window.removeEventListener("aang:navigate", this.onNavigate);
  }

  private updateActiveLink(): void {
    const currentPath = routePathFromUrl(window.location.pathname);
    this.root.querySelectorAll<HTMLAnchorElement>("nav a").forEach((link) => {
      const linkPath = routePathFromUrl(new URL(link.href).pathname);
      const active = linkPath === "/" ? currentPath === "/" || currentPath.startsWith("/stories/") : linkPath === currentPath;
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }
}

if (!customElements.get("site-header")) customElements.define("site-header", SiteHeader);
