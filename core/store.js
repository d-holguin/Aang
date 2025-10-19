export class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = new Set();
    }

    getState() {
        return this.state;
    }

    setState(partial) {
        this.state = { ...this.state, ...partial };
        this.notify();
    }
    // this returns the cleanup function so calling what this return will run the teardown logic which is needed to prevent memory leaks.
    // example
    //    connectedCallback() {
    //         this.unsubscribe = appStore.subscribe((state) => this.render(state));
    //     }

    //     disconnectedCallback() {
    //         this.unsubscribe?.();
    //     }
    subscribe(fn) {
        this.listeners.add(fn);
        fn(this.state); // emit initial state
        return () => this.listeners.delete(fn);
    }

    notify() {
        this.listeners.forEach((fn) => fn(this.state));
    }
}

export const globalStore = new Store({
    count: 0,
});
