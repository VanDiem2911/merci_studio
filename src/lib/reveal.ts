import { useSyncExternalStore } from "react";

/**
 * True once the preloader / page transition has lifted and entrance animations may play.
 * A tiny external store so components can subscribe without setState-in-effect.
 */
let ready = false;
const listeners = new Set<() => void>();

export const revealStore = {
  get: () => ready,
  set(next: boolean) {
    if (ready === next) return;
    ready = next;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useRevealed(): boolean {
  return useSyncExternalStore(revealStore.subscribe, revealStore.get, () => false);
}
