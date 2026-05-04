import { createStore } from '../../utils/index.ts';
import type { Circle } from '../types/index.ts';

const createGuideCircleStore = () => {
  const { state, subscribe } = createStore<{ guideCircle: Circle | null; isVisible: boolean }>({
    guideCircle: null,
    isVisible: false,
  });

  return {
    state,
    subscribe,
    createGuideCircle: (guideCircle: Circle) => {
      state.guideCircle = guideCircle;
      state.isVisible = true;
    },
    pan: (dx: number, dy: number) => {
      state.guideCircle = {
        ...state.guideCircle!,
        x: dx,
        y: dy,
      };
      state.isVisible = true;
    },
    updateVisibility: (isVisible: boolean) => {
      state.isVisible = isVisible;
    },
    increaseSize: (size: number) => {
      state.guideCircle = {
        ...state.guideCircle!,
        size,
      };
    },
  };
};

export const guideCircleStore = createGuideCircleStore();
