import { createStore } from '../../utils/index.ts';
import type { Cursor } from '../types/index.ts';

const createCursorStore = () => {
  const { state, subscribe } = createStore<{ cursors: Record<string, Cursor> }>({
    cursors: {},
  });

  return {
    state,
    subscribe,
    setCursor: (cursor: Cursor) => {
      state.cursors = {
        ...state.cursors,
        [cursor.id]: cursor,
      };
    },
    deleteCursor: (userId: string) => {
      const updatedCursors = { ...state.cursors };
      delete updatedCursors[userId];

      state.cursors = updatedCursors;
    },
    getCursors: (): Cursor[] => {
      return Object.values(state.cursors);
    },
  };
};

export const cursorStore = createCursorStore();
