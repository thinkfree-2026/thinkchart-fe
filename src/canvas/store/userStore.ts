import { createStore } from '../../utils/index.ts';
import type { User } from '../types/index.ts';

const createCursorStore = () => {
  const { state, subscribe } = createStore<User>({
    userId: null,
    color: null,
  });

  return {
    state,
    subscribe,
    setUserId: (userId: string, color: string) => {
      state.userId = userId;
      state.color = color;
    },
  };
};

export const userStore = createCursorStore();
