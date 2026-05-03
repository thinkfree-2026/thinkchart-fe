import { createStore } from '../../utils/index.ts';
import type { Circle } from '../types/index.ts';

const CircleStore = () => {
  const { state, subscribe } = createStore<{ circle: Circle[] }>({
    circle: [],
  });

  return {
    state,
    subscribe,
    getCircles(): Circle[] {
      return [...state.circle];
    },
    getCount(): number {
      return state.circle.length;
    },
    addCircle(circle: Circle) {
      state.circle = [...state.circle, circle];
    },
  };
};

export const circleStore = CircleStore();
