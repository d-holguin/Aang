export type StoreListener<State> = (state: Readonly<State>) => void;

export class Store<State extends object> {
  private state: State;
  private readonly listeners = new Set<StoreListener<State>>();

  constructor(initialState: State) {
    this.state = { ...initialState };
  }

  getState(): Readonly<State> {
    return this.state;
  }

  setState(partial: Partial<State>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(listener: StoreListener<State>): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    // Copy the set so subscription changes during a callback affect the next update.
    [...this.listeners].forEach((listener) => listener(this.state));
  }
}

export interface GlobalState {
  count: number;
}

export const globalStore = new Store<GlobalState>({ count: 0 });
