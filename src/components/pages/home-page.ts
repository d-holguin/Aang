import { globalStore, Store, type GlobalState } from "../../core/store";

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
    this.unsubscribeLocal = this.localStore.subscribe((local) => this.render(local, globalStore.getState()));
    this.unsubscribeGlobal = globalStore.subscribe((global) => this.render(this.localStore.getState(), global));
  }

  disconnectedCallback(): void {
    this.unsubscribeLocal?.();
    this.unsubscribeGlobal?.();
    this.unsubscribeLocal = undefined;
    this.unsubscribeGlobal = undefined;
  }

  private render(localState: Readonly<LocalState>, globalState: Readonly<GlobalState>): void {
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
        <button id="incLocal" type="button">Local Counter (per component): ${localState.count}</button>
        <button id="incGlobal" type="button">Global Counter (shared): ${globalState.count}</button>
        <div style="font-size: 12px; color: #4A90E2;">
          <p>
            Navigate to <a href="/about" data-link style="text-decoration: underline; color: inherit;">/about</a>
            to see the local store reset and the global store retained.
          </p>
        </div>
      </section>
    `;

    this.root.querySelector<HTMLButtonElement>("#incLocal")?.addEventListener("click", () => {
      this.localStore.setState({ count: this.localStore.getState().count + 1 });
    });
    this.root.querySelector<HTMLButtonElement>("#incGlobal")?.addEventListener("click", () => {
      globalStore.setState({ count: globalStore.getState().count + 1 });
    });
  }
}

if (!customElements.get("home-page")) customElements.define("home-page", HomePage);
