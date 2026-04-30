/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

type Listener<T> = (value: T) => void;

export const createStore = <T extends object>(initialState: T) => {
  const listeners: { [K in keyof T]?: Set<Listener<T[K]>> } = {};

  const state = new Proxy(initialState, {
    set(target, key: string | symbol, value: any) {
      if (target[key as keyof T] === value) return true;

      target[key as keyof T] = value;

      if (listeners[key as keyof T]) {
        listeners[key as keyof T]!.forEach(fn => fn(value));
      }

      return true;
    },
  });

  const subscribe = <K extends keyof T>(key: K, listener: Listener<T[K]>) => {
    if (!listeners[key]) {
      listeners[key] = new Set();
    }
    listeners[key]!.add(listener);

    return () => {
      listeners[key]!.delete(listener);
    };
  };

  return { state, subscribe };
};
