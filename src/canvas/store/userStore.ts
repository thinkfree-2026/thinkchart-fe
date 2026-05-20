import { createStore } from '../../utils/index.ts';
import type { User } from '../types/index.ts';

const createUserStore = () => {
  const { state, subscribe } = createStore<User>({
    userId: null,
    color: null,
  });

  return {
    state,
    subscribe,
    setUser: (userId: string, color: '1' | '2' | '3') => {
      state.userId = userId;
      state.color = color;
    },
  };
};

export const userStore = createUserStore();
