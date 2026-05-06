import { createStore } from '../../utils/index.ts';
import type { Selection } from '../types/index.ts';

const createSelectionStore = () => {
  const { state, subscribe } = createStore<{ selection: Selection }>({
    selection: {
      hoveredIndex: -1,
      selectedIndex: -1,
    },
  });

  return {
    state,
    subscribe,
    setHover(index: number) {
      if (state.selection.hoveredIndex === index) return;
      state.selection = {
        ...state.selection,
        hoveredIndex: index,
      };
    },
    setSelect(index: number) {
      state.selection = {
        ...state.selection,
        selectedIndex: index,
      };
    },
  };
};

export const selectionStore = createSelectionStore();
