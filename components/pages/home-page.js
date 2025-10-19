import { Store, globalStore } from "../../core/store.js";

class HomePage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.localStore = new Store({ count: 0 });

        this.unsubLocal = this.localStore.subscribe((state) =>
            this.render(state, globalStore.getState())
        );
        this.unsubGlobal = globalStore.subscribe((state) =>
            this.render(this.localStore.getState(), state)
        );
    }

    disconnectedCallback() {
        this.unsubLocal?.();
        this.unsubGlobal?.();
    }

    render(localState, globalState) {
        this.shadowRoot.innerHTML = `
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
            gap: 0.25rem
        }

        h2 {
          color: #4A90E2;
          margin-bottom: 0.5rem;
        }

        button {
          background: #4A90E2;
          color: #FFF8E7;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          cursor: pointer;
        }

        button:hover {
          opacity: 0.9;
        }
      </style>

      <div id="homeContainer">
        <h1>Welcome to Aang!</h1>
        <button id="incLocal">Local Counter (per component):${localState.count}</button>
        <button id="incGlobal">Global Counter (shared):${globalState.count}</button>
        <div style="font-size: 12px; color: #4A90E2;">
            <p>
                Navigate to
                <a href="/about" style="text-decoration: underline; color: inherit;">/About</a>
                to see the local store destroyed and the global store retained.
            </p>
        </div>
      </div>
        
      `;

        this.shadowRoot.querySelector("#incLocal").onclick = () => {
            this.localStore.setState({ count: localState.count + 1 });
        };

        this.shadowRoot.querySelector("#incGlobal").onclick = () => {
            globalStore.setState({ count: globalState.count + 1 });
        };
    }
}

customElements.define("home-page", HomePage);
