import { Router } from "./router.js";
import "../components/pages/home-page.js";
import "../components/pages/about-page.js";
import "../components/navbar.js";

class AppRoot extends HTMLElement {
    connectedCallback() {
        this.render();

        this.router = new Router(
            {
                "/": "home-page",
                "/about": "about-page",
            },
            "app-root"
        );

        // delegate navigation in light dom
        this.addEventListener("click", (e) => {
            const link = e.target.closest("a[data-link]");
            if (link) {
                e.preventDefault();
                this.router.navigate(link.getAttribute("href"));
            }
        });
    }

    render() {
        this.innerHTML = `
      <style>
        main {
            opacity: 1;
            transition: opacity 0.5s ease-in-out;
            margin: 0rem;
        }
        main.fade-out {
          opacity: 0;
        }
      </style>
      <app-navbar></app-navbar>
      <main id="view"></main>
    `;
    }

    async renderView(tagName) {
        const container = this.querySelector("#view");
        container.classList.add("fade-out");
        await new Promise((r) => setTimeout(r, 150));
        container.innerHTML = `<${tagName}></${tagName}>`;
        requestAnimationFrame(() => container.classList.remove("fade-out"));
    }
}

customElements.define("app-root", AppRoot);
