export type StoreListener<State> = (state: Readonly<State>) => void;

/**
 * A small shallow-merge store. Treat nested values as immutable and replace
 * them when updating state; the store freezes its own top-level state object.
 */
export class Store<State extends object> {
  private state: State;
  private readonly listeners = new Set<StoreListener<State>>();

  constructor(initialState: State) {
    this.state = Object.freeze({ ...initialState }) as State;
  }

  getState(): Readonly<State> {
    return this.state;
  }

  setState(partial: Partial<State>): void {
    const nextState = { ...this.state, ...partial };
    const nextKeys = Object.keys(nextState);
    const currentKeys = Object.keys(this.state);
    if (
      nextKeys.length === currentKeys.length &&
      nextKeys.every((key) => Object.hasOwn(this.state, key) && Object.is(nextState[key as keyof State], this.state[key as keyof State]))
    ) return;
    this.state = Object.freeze(nextState) as State;
    this.notify();
  }

  update(updater: (state: Readonly<State>) => Partial<State>): void {
    this.setState(updater(this.state));
  }

  subscribe(listener: StoreListener<State>): () => void {
    this.listeners.add(listener);
    this.callListener(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    // Copy the set so subscription changes during a callback affect the next update.
    [...this.listeners].forEach((listener) => this.callListener(listener));
  }

  private callListener(listener: StoreListener<State>): void {
    try {
      listener(this.state);
    } catch (error) {
      // One broken subscriber should not prevent the remaining listeners from updating.
      console.error("Aang store subscriber failed:", error);
    }
  }
}
