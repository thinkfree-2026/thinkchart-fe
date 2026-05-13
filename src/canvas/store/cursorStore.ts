import { createStore } from '../../utils/index.ts';
import type { Cursor } from '../types/index.ts';

const createCursorStore = () => {
  const { state, subscribe } = createStore<{ cursor: Cursor | null }>({
    cursor: null,
  });

  return {
    state,
    subscribe,
    setCursor: (cursor: Cursor) => {
      state.cursor = cursor;
    },
  };
};

export const cursorStore = createCursorStore();
