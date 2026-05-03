import { createStore } from '../../utils/index.ts';
import type { GuideCircle } from '../types/index.ts';

const createGuideCircleStore = () => {
  const { state, subscribe } = createStore<{ guideCircle: GuideCircle }>({
    guideCircle: {
      x: 0,
      y: 0,
      isVisible: false,
    },
  });

  return {
    state,
    subscribe,
    pan: (dx: number, dy: number) => {
      state.guideCircle = { x: dx, y: dy, isVisible: true };
    },
    updateVisibility: (isVisible: boolean) => {
      state.guideCircle = { ...state.guideCircle, isVisible };
    },
  };
};

export const guideCircleStore = createGuideCircleStore();
