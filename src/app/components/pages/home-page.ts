import { Store } from "../../../framework/store";
import { appStore } from "../../store";

interface LocalState {
  count: number;
}

class HomePage extends HTMLElement {
  private readonly root: ShadowRoot;
  private readonly localStore = new Store<LocalState>({ count: 0 });
  private unsubscribeLocal?: () => void;
  private unsubscribeGlobal?: () => void;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    if (this.unsubscribeLocal || this.unsubscribeGlobal) return;
    this.renderShell();
    this.unsubscribeLocal = this.localStore.subscribe(() => this.updateCounters());
    this.unsubscribeGlobal = appStore.subscribe(() => this.updateCounters());
    this.root.querySelector<HTMLButtonElement>("#incLocal")?.addEventListener("click", () => {
      this.localStore.update((state) => ({ count: state.count + 1 }));
    });
    this.root.querySelector<HTMLButtonElement>("#incGlobal")?.addEventListener("click", () => {
      appStore.update((state) => ({ count: state.count + 1 }));
    });
  }

  disconnectedCallback(): void {
    this.unsubscribeLocal?.();
    this.unsubscribeGlobal?.();
    this.unsubscribeLocal = undefined;
    this.unsubscribeGlobal = undefined;
  }

  private renderShell(): void {
    this.root.innerHTML = `
      <style>
        #homeContainer {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          background: #FFF8E7;
          color: #333;
          border-radius: 1rem;
          max-width: 400px;
          margin: 2rem auto;
          font-family: system-ui, sans-serif;
          gap: 0.25rem;
        }
        h1 { color: #4A90E2; margin-bottom: 0.5rem; }
        button {
          background: #4A90E2;
          color: #FFF8E7;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          cursor: pointer;
        }
        button:hover { opacity: 0.9; }
      </style>
      <section id="homeContainer">
        <h1>Welcome to Aang!</h1>
        <button id="incLocal" type="button">Local Counter (per component): <span id="localCount"></span></button>
        <button id="incGlobal" type="button">Global Counter (shared): <span id="globalCount"></span></button>
        <div style="font-size: 12px; color: #4A90E2;">
          <p>
            Navigate to <a href="/about" data-link style="text-decoration: underline; color: inherit;">/about</a>
            to see the local store reset and the global store retained.
          </p>
        </div>
      </section>
    `;
    this.updateCounters();
  }

  private updateCounters(): void {
    const localCount = this.root.querySelector<HTMLElement>("#localCount");
    const globalCount = this.root.querySelector<HTMLElement>("#globalCount");
    if (localCount) localCount.textContent = String(this.localStore.getState().count);
    if (globalCount) globalCount.textContent = String(appStore.getState().count);
  }
}

if (!customElements.get("home-page")) customElements.define("home-page", HomePage);
