"use client";

import { useSyncExternalStore } from "react";

// A tiny external store, so 3D and DOM components can share state without a library.
function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: T) => {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export type Quality = "high" | "low";
export type Theme = "light" | "dark";

export const loaderDoneStore = createStore(false);
/** Flips on the visitor's first interaction (or after an idle fallback); gates the 3D canvas. */
export const interactedStore = createStore(false);
export const qualityStore = createStore<Quality>("high");
export const themeStore = createStore<Theme>("light");
export const menuOpenStore = createStore(false);

type Store<T> = ReturnType<typeof createStore<T>>;

export function useStore<T>(store: Store<T>, serverValue: T): T {
  return useSyncExternalStore(store.subscribe, store.get, () => serverValue);
}

// Pointer in normalized viewport space (-1..1), read every frame by the 3D scene.
export const pointer = { x: 0, y: 0, active: false };
