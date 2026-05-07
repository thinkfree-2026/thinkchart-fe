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
    set: (circle: Circle) => {
      state.guideCircle = {
        ...state.guideCircle,
        circle,
      };
    },
    show: () => {
      if (state.guideCircle.isVisible) return;
      state.guideCircle = {
        ...state.guideCircle,
        isVisible: true,
      };
    },
    hide: () => {
      if (!state.guideCircle.isVisible) return;
      state.guideCircle = {
        ...state.guideCircle,
        isVisible: false,
      };
    },
    setVisible: (isVisible: boolean) => {
      if (state.guideCircle.isVisible === isVisible) return;
      state.guideCircle = {
        ...state.guideCircle,
        isVisible,
      };
    },
    setRadius: (radius: number) => {
      if (!state.guideCircle.circle) return;
      state.guideCircle = {
        ...state.guideCircle,
        circle: {
          ...state.guideCircle.circle,
          radius,
        },
      };
    },
  };
};

export const guideCircleStore = createGuideCircleStore();
