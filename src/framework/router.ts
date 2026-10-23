export type RouteTable = Record<string, string>;

export interface NavigationDetail {
  url: URL;
  /** The route path without the configured deployment base path. */
  path: string;
  query: URLSearchParams;
  params: Record<string, string>;
}

export interface RouterOptions {
  /** URL prefix where the app is deployed, such as `/docs/`. Defaults to `/`. */
  basePath?: string;
  /** Time to wait for the outlet's fade-out transition. Defaults to 150ms. */
  transitionDuration?: number;
}

interface RouteMatch {
  tagName: string;
  params: Record<string, string>;
}

export class Router {
  private readonly routes: RouteTable;
  private readonly outlet: HTMLElement;
  private readonly basePath: string;
  private readonly transitionDuration: number;
  private currentPath: string | null = null;
  private renderSequence = 0;
  private pendingRenderTimer?: number;
  private pendingRenderResolve?: () => void;
  private readonly onPopState = (): void => this.resolve();
  private readonly onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.composedPath().find(
      (node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement && node.hasAttribute("data-link"),
    );
    if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;

    const destination = new URL(anchor.href, window.location.href);
    if (destination.origin !== window.location.origin || !this.isWithinBasePath(destination.pathname)) return;
    if (
      destination.pathname === window.location.pathname &&
      destination.search === window.location.search
    ) {
      if (destination.hash !== window.location.hash) return;
      event.preventDefault();
      return;
    }

    event.preventDefault();
    this.navigate(this.toRoutePath(destination.pathname) + destination.search + destination.hash);
  };

  constructor(routes: RouteTable, outlet: HTMLElement, options: RouterOptions = {}) {
    this.routes = this.validateRoutes(routes);
    this.outlet = outlet;
    this.basePath = this.normalizeBasePath(options.basePath ?? "/");
    this.transitionDuration = Math.max(0, options.transitionDuration ?? 150);
    this.outlet.addEventListener("click", this.onClick);
    window.addEventListener("popstate", this.onPopState);

    // Static hosts such as GitHub Pages pass unknown paths through a 404 page.
    // Restore that path before resolving the initial route.
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (redirect?.startsWith("/")) {
      const destination = new URL(redirect, window.location.href);
      if (destination.origin === window.location.origin && this.isWithinBasePath(destination.pathname)) {
        window.history.replaceState({}, "", destination.href);
      }
    }

    this.resolve();
  }

  /** Navigate to an app route path, such as `/stories/example`. */
  navigate(path: string): void {
    const destination = new URL(this.toBasePath(path), window.location.href);
    if (destination.origin !== window.location.origin || !this.isWithinBasePath(destination.pathname)) return;

    const nextUrl = `${destination.pathname}${destination.search}${destination.hash}`;
    if (nextUrl === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
    window.history.pushState({}, "", nextUrl);
    this.resolve();
  }

  destroy(): void {
    this.renderSequence += 1;
    this.cancelPendingRender();
    this.outlet.removeEventListener("click", this.onClick);
    window.removeEventListener("popstate", this.onPopState);
  }

  private resolve(): void {
    const url = new URL(window.location.href);
    const path = this.toRoutePath(url.pathname);
    if (path === undefined) {
      this.outlet.dispatchEvent(new CustomEvent("aang:routeerror", { detail: { path: url.pathname, url }, bubbles: true }));
      return;
    }
    const match = this.matchRoute(path) ?? (this.routes["/404"] ? { tagName: this.routes["/404"], params: {} } : undefined);

    if (!match) {
      this.outlet.dispatchEvent(new CustomEvent("aang:routeerror", { detail: { path, url }, bubbles: true }));
      return;
    }

    const detail: NavigationDetail = { url, path, query: url.searchParams, params: match.params };
    this.outlet.dispatchEvent(new CustomEvent<NavigationDetail>("aang:navigate", { detail, bubbles: true }));
    if (path === this.currentPath) {
      this.outlet.querySelector("#view")?.firstElementChild?.dispatchEvent(
        new CustomEvent<NavigationDetail>("aang:routechange", { detail, bubbles: true }),
      );
      if (url.hash) requestAnimationFrame(() => this.scrollToHash(url.hash));
      return;
    }
    this.currentPath = path;
    void this.renderView(match.tagName, match.params, url.hash);
  }

  private async renderView(tagName: string, params: Record<string, string>, hash: string): Promise<void> {
    const view = this.outlet.querySelector<HTMLElement>("#view");
    if (!view) return;

    this.cancelPendingRender();
    const renderId = ++this.renderSequence;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const delay = reducedMotion ? 0 : this.transitionDuration;
    view.style.setProperty("--aang-transition-duration", `${this.transitionDuration}ms`);
    view.classList.toggle("fade-out", delay > 0);
    if (delay > 0) {
      await new Promise<void>((resolve) => {
        this.pendingRenderResolve = resolve;
        this.pendingRenderTimer = window.setTimeout(() => {
          this.pendingRenderTimer = undefined;
          this.pendingRenderResolve = undefined;
          resolve();
        }, delay);
      });
    }
    if (renderId !== this.renderSequence || !view.isConnected) return;

    const page = document.createElement(tagName);
    Object.entries(params).forEach(([name, value]) => page.setAttribute(name, value));
    view.replaceChildren(page);
    view.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      if (renderId !== this.renderSequence) return;
      view.classList.remove("fade-out");
      if (hash) this.scrollToHash(hash);
    });
  }

  private cancelPendingRender(): void {
    if (this.pendingRenderTimer !== undefined) {
      window.clearTimeout(this.pendingRenderTimer);
      this.pendingRenderTimer = undefined;
    }
    const resolve = this.pendingRenderResolve;
    this.pendingRenderResolve = undefined;
    resolve?.();
  }

  private scrollToHash(hash: string): void {
    let id = hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // Keep the raw fragment if it is not valid percent-encoding.
    }
    const findInRoot = (root: Document | ShadowRoot): HTMLElement | null => {
      const directMatch = root.getElementById(id);
      if (directMatch instanceof HTMLElement) return directMatch;
      for (const host of root.querySelectorAll<HTMLElement>("*")) {
        if (!host.shadowRoot) continue;
        const nestedMatch = findInRoot(host.shadowRoot);
        if (nestedMatch) return nestedMatch;
      }
      return null;
    };
    findInRoot(document)?.scrollIntoView();
  }

  private validateRoutes(routes: RouteTable): RouteTable {
    const validated: RouteTable = {};
    const routeShapes = new Set<string>();
    for (const [pattern, tagName] of Object.entries(routes)) {
      if (!pattern.startsWith("/")) {
        throw new Error(`Invalid route pattern "${pattern}": use a leading slash.`);
      }
      if (!/^[a-z][.\d_a-z-]*-[.\d_a-z-]+$/.test(tagName)) {
        throw new Error(`Invalid custom element name "${tagName}" for route "${pattern}".`);
      }
      const params = pattern.split("/").filter(Boolean).filter((part) => part.startsWith(":"));
      const names = params.map((part) => part.slice(1));
      if (names.some((name) => !/^[A-Za-z_][\w.-]*$/.test(name)) || new Set(names).size !== names.length) {
        throw new Error(`Invalid or duplicate parameter name in route pattern "${pattern}".`);
      }
      const normalizedPattern = this.normalizePath(pattern);
      const shape = normalizedPattern.split("/").filter(Boolean).map((part) => part.startsWith(":") ? ":" : part).join("/");
      if (routeShapes.has(shape)) throw new Error(`Ambiguous route pattern "${pattern}" duplicates another route shape.`);
      routeShapes.add(shape);
      validated[normalizedPattern] = tagName;
    }
    return validated;
  }

  private normalizeBasePath(path: string): string {
    const normalized = `/${path.split("/").filter(Boolean).join("/")}`;
    return normalized === "/" ? "/" : `${normalized}/`;
  }

  private isWithinBasePath(path: string): boolean {
    if (this.basePath === "/") return path.startsWith("/");
    return path === this.basePath.slice(0, -1) || path.startsWith(this.basePath);
  }

  private toRoutePath(path: string): string | undefined {
    if (!this.isWithinBasePath(path)) return undefined;
    if (this.basePath === "/") return this.normalizePath(path);
    return this.normalizePath(path.slice(this.basePath.length - 1));
  }

  private toBasePath(path: string): string {
    if (this.basePath === "/") return path.startsWith("/") ? path : `/${path}`;
    const routePath = path.startsWith("/") ? path.slice(1) : path;
    return `${this.basePath}${routePath}`;
  }

  private normalizePath(path: string): string {
    return path.replace(/\/$/, "") || "/";
  }

  private matchRoute(path: string): RouteMatch | undefined {
    const pathParts = this.normalizePath(path).split("/").filter(Boolean);
    const candidates = Object.entries(this.routes)
      .filter(([pattern]) => pattern !== "/404")
      .sort(([left], [right]) => {
        const leftParts = this.normalizePath(left).split("/").filter(Boolean);
        const rightParts = this.normalizePath(right).split("/").filter(Boolean);
        for (let index = 0; index < Math.min(leftParts.length, rightParts.length); index += 1) {
          const leftStatic = !leftParts[index].startsWith(":");
          const rightStatic = !rightParts[index].startsWith(":");
          if (leftStatic !== rightStatic) return leftStatic ? -1 : 1;
        }
        return rightParts.length - leftParts.length;
      });

    for (const [pattern, tagName] of candidates) {
      const patternParts = this.normalizePath(pattern).split("/").filter(Boolean);
      if (patternParts.length !== pathParts.length) continue;

      const params: Record<string, string> = {};
      let matches = true;
      for (let index = 0; index < patternParts.length; index += 1) {
        const expected = patternParts[index];
        const actual = pathParts[index];
        if (expected.startsWith(":")) {
          try {
            params[expected.slice(1)] = decodeURIComponent(actual);
          } catch {
            matches = false;
            break;
          }
        } else if (expected !== actual) {
          matches = false;
          break;
        }
      }
      if (matches) return { tagName, params };
    }
    return undefined;
  }
}
