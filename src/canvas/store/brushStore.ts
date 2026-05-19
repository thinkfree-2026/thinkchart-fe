import { createStore } from '../../utils/index.ts';

const createBrushStore = () => {
  const { state, subscribe } = createStore({
    brush: {
      isVisible: false,
      points: [] as Array<{ x: number; y: number }>,
    },
  });

  return {
    state,
    subscribe,
    update: (points: Array<{ x: number; y: number }>) => {
      state.brush = { isVisible: true, points };
    },
    hide: () => {
      state.brush = { ...state.brush, isVisible: false, points: [] };
    },
  };
};

export const brushStore = createBrushStore();
