export type RouteTable = Record<string, string>;

export interface NavigationDetail {
  url: URL;
  path: string;
  query: URLSearchParams;
}

export class Router {
  private readonly routes: RouteTable;
  private readonly outlet: HTMLElement;
  private currentPath: string | null = null;
  private readonly onPopState = (): void => this.resolve();
  private readonly onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.composedPath().find(
      (node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement && node.hasAttribute("data-link"),
    );
    if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;

    const destination = new URL(anchor.href, window.location.href);
    if (destination.origin !== window.location.origin) return;
    if (
      destination.pathname === window.location.pathname &&
      destination.search === window.location.search
    ) return; // Let the browser handle in-page hash links and same-page links.

    event.preventDefault();
    this.navigate(`${destination.pathname}${destination.search}${destination.hash}`);
  };

  constructor(routes: RouteTable, outlet: HTMLElement) {
    this.routes = routes;
    this.outlet = outlet;
    this.outlet.addEventListener("click", this.onClick);
    window.addEventListener("popstate", this.onPopState);

    // Static hosts such as GitHub Pages pass unknown paths through a 404 page.
    // Restore that path before resolving the initial route.
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (redirect?.startsWith("/")) {
      window.history.replaceState({}, "", redirect);
    }

    this.resolve();
  }

  navigate(path: string): void {
    const destination = new URL(path, window.location.href);
    if (destination.origin !== window.location.origin) return;

    const nextUrl = `${destination.pathname}${destination.search}${destination.hash}`;
    if (nextUrl === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
    window.history.pushState({}, "", nextUrl);
    this.resolve();
  }

  destroy(): void {
    this.outlet.removeEventListener("click", this.onClick);
    window.removeEventListener("popstate", this.onPopState);
  }

  private resolve(): void {
    const url = new URL(window.location.href);
    const path = this.normalizePath(url.pathname);
    const tagName = this.routes[path] ?? this.routes["/404"];

    if (!tagName) {
      this.outlet.dispatchEvent(new CustomEvent("aang:routeerror", {
        detail: { path, url },
        bubbles: true,
      }));
      return;
    }

    const detail: NavigationDetail = { url, path, query: url.searchParams };
    this.outlet.dispatchEvent(new CustomEvent<NavigationDetail>("aang:navigate", { detail, bubbles: true }));
    if (path === this.currentPath) return;
    this.currentPath = path;
    void this.renderView(tagName);
  }

  private async renderView(tagName: string): Promise<void> {
    const view = this.outlet.querySelector<HTMLElement>("#view");
    if (!view) return;

    const renderId = ++this.renderSequence;
    view.classList.add("fade-out");
    await new Promise<void>((resolve) => window.setTimeout(resolve, 150));
    if (renderId !== this.renderSequence || !view.isConnected) return;

    view.replaceChildren(document.createElement(tagName));
    requestAnimationFrame(() => {
      if (renderId === this.renderSequence) view.classList.remove("fade-out");
    });
  }

  private renderSequence = 0;

  private normalizePath(path: string): string {
    return path.replace(/\/$/, "") || "/";
  }
}
