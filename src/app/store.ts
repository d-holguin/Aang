import { Store } from "../framework/store";

export interface AppState {
  count: number;
}

// This belongs to the demo app; framework/store only exports the reusable primitive.
export const appStore = new Store<AppState>({ count: 0 });
