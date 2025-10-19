// core/router.js
export class Router {
    constructor(routes, outletSelector) {
        this.routes = routes;
        this.outlet = document.querySelector(outletSelector);
        this.currentPath = null;

        // Listen for browser navigation
        window.addEventListener("popstate", () => this.resolve());

        document.addEventListener("click", (e) => {
            // Traverse through composed path — includes shadow DOM nodes
            const path = e.composedPath();
            const link = path.find(
                (el) =>
                    el.tagName === "A" && el.getAttribute("href")?.startsWith("/")
            );

            if (link && link.getAttribute("target") !== "_blank") {
                e.preventDefault();
                this.navigate(link.getAttribute("href"));
            }
        });

   
        this.resolve();
    }

    navigate(path) {
        if (path !== this.currentPath) {
            history.pushState({}, "", path);
            this.resolve();
        }
    }

    resolve() {
        const path = location.pathname || "/";
        if (path === this.currentPath) return; //Prevent redundant re-render
        this.currentPath = path;

        const tagName = this.routes[path] || this.routes["/"];
        if (this.outlet) this.outlet.renderView(tagName);
    }
}
