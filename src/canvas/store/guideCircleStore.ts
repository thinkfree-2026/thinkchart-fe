import { createStore } from '../../utils/index.ts';
import { RADIUS_RATIO } from '../constants/index.ts';
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
    set: (circle: Omit<Circle, 'userId' | 'id' | 'opacity'>) => {
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
    // setRadius: (radius: number) => {
    //   if (!state.guideCircle.circle) return;
    //   state.guideCircle = {
    //     ...state.guideCircle,
    //     circle: {
    //       ...state.guideCircle.circle,
    //       radius,
    //     },
    //   };
    // },
    setValue: (value: number) => {
      if (!state.guideCircle.circle) return;
      state.guideCircle = {
        ...state.guideCircle,
        circle: {
          ...state.guideCircle.circle,
          value,
          radius: value / RADIUS_RATIO,
        },
      };
    },
  };
};

export const guideCircleStore = createGuideCircleStore();
