import { createStore } from '../../utils/index.ts';
import type { Circle, GuideCircle } from '../types/index.ts';

const createGuideCircleStore = () => {
  const { state, subscribe } = createStore<{ guideCircle: GuideCircle }>({
    guideCircle: {
      circle: null,
      isVisible: false,
    },
  });

  return {
    state,
    subscribe,
    createGuideCircle: (circle: Circle) => {
      state.guideCircle = {
        circle,
        isVisible: true,
      };
    },
    pan: (dx: number, dy: number) => {
      if (!state.guideCircle.circle) return;

      state.guideCircle = {
        circle: {
          ...state.guideCircle.circle,
          x: dx,
          y: dy,
        },
        isVisible: true,
      };
    },
    updateVisibility: (isVisible: boolean) => {
      state.guideCircle.isVisible = isVisible;
    },
    increaseSize: (size: number) => {
      if (!state.guideCircle.circle) return;

      state.guideCircle = {
        circle: {
          ...state.guideCircle.circle,
          size,
        },
        isVisible: true,
      };
    },
  };
};

export const guideCircleStore = createGuideCircleStore();
