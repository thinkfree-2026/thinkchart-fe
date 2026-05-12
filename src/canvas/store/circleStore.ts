import { createStore } from '../../utils/index.ts';
import { MAX_CIRCLE_COUNT } from '../constants/index.ts';
import type { Circle } from '../types/index.ts';

const CircleStore = () => {
  const { state, subscribe } = createStore<{ circles: Circle[]; version: number }>({
    circles: [],
    version: 0,
  });

  return {
    state,
    subscribe,
    getCircles(): Circle[] {
      return state.circles;
    },
    getCount(): number {
      return state.circles.length;
    },
    addCircle(circle: Circle) {
      if (state.circles.length >= MAX_CIRCLE_COUNT) {
        console.warn(`최대 생성 개수(${MAX_CIRCLE_COUNT})를 초과하여 더 이상 원을 생성할 수 없습니다.`);
        return;
      }
      state.circles.push(circle);
      state.version += 1;
    },
    deleteCircle(index: number) {
      if (index >= 0 && index < state.circles.length) {
        state.circles.splice(index, 1);
        state.version += 1;
      }
    },
    updateCirclePosition(index: number, x: number, y: number) {
      if (index >= 0 && index < state.circles.length) {
        state.circles[index].x = x;
        state.circles[index].y = y;
        state.version += 1;
      }
    },
    setValue(index: number, value: number) {
      if (index >= 0 && index < state.circles.length) {
        state.circles[index] = {
          ...state.circles[index],
          value,
        };
        state.version += 1;
      }
    },
    setOpacity(index: number, opacity: number) {
      if (index >= 0 && index < state.circles.length) {
        state.circles[index] = {
          ...state.circles[index],
          opacity,
        };
        state.version += 1;
      }
    },
  };
};

export const circleStore = CircleStore();
