import { createStore } from '../../utils/index.ts';

const createCursorStore = () => {
  const { state, subscribe } = createStore<{ userId: string }>({
    userId: '',
  });

  return {
    state,
    subscribe,
    setUserId: (userId: string) => {
      state.userId = userId;
    },
  };
};

export const userStore = createCursorStore();
