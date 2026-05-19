import { createStore } from '../../utils/index.ts';
import { MAX_CIRCLE_COUNT } from '../constants/index.ts';
import type { Circle } from '../types/index.ts';

const createCircleStore = () => {
  const { state, subscribe } = createStore<{ circles: Circle[]; version: number }>({
    circles: [],
    version: 0,
  });

  return {
    state,
    subscribe,
    getCircles: (): Circle[] => {
      return state.circles;
    },
    getCount: (): number => {
      return state.circles.length;
    },
    addCircle: (circle: Circle) => {
      if (state.circles.length >= MAX_CIRCLE_COUNT) {
        console.warn(`최대 생성 개수(${MAX_CIRCLE_COUNT})를 초과하여 더 이상 원을 생성할 수 없습니다.`);
        return;
      }
      state.circles.push(circle);
      state.version += 1;
    },
    deleteCircle: (id: string) => {
      const selectedIndex = state.circles.findIndex(circle => circle.id === id);

      if (selectedIndex !== -1) {
        state.circles.splice(selectedIndex, 1);
        state.version += 1;
      }
    },
    updateCirclePosition: (index: number, x: number, y: number) => {
      if (index >= 0 && index < state.circles.length) {
        state.circles[index].x = x;
        state.circles[index].y = y;
        state.version += 1;
      }
    },
    updateCircleId: (tempId: string, id: string) => {
      const index = state.circles.findIndex(circle => circle.id === tempId);

      if (index !== -1) {
        state.circles[index].id = id;
        state.version += 1;
      }
    },
    // updateCircleUserId: (userId: string, id: string) => {
    //   const index = state.circles.findIndex(circle => circle.userId === userId && circle.id === '');
    //
    //   if (index !== -1) {
    //     state.circles[index].id = id;
    //     state.version += 1;
    //   }
    // },
    updateCircleChartId: (id: string) => {
      const index = state.circles.findIndex(circle => circle.id === id);

      if (index !== -1) {
        state.circles[index].chartId = null;
        state.version += 1;
      }
    },
  };
};

export const circleStore = createCircleStore();
