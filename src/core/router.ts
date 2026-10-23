export type RouteTable = Record<string, string>;

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
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    if (path === this.currentPath) return;
    this.currentPath = path;

    const tagName = this.routes[path] ?? this.routes["/"];
    if (tagName) void this.renderView(tagName);
  }

  private async renderView(tagName: string): Promise<void> {
    const view = this.outlet.querySelector<HTMLElement>("#view");
    if (!view) return;

    const renderId = String(++this.renderSequence);
    view.dataset.renderId = renderId;
    view.classList.add("fade-out");
    await new Promise<void>((resolve) => window.setTimeout(resolve, 150));
    if (view.dataset.renderId !== renderId || !view.isConnected) return;

    view.replaceChildren(document.createElement(tagName));
    requestAnimationFrame(() => {
      if (view.dataset.renderId === renderId) view.classList.remove("fade-out");
    });
  }

  private renderSequence = 0;
}
