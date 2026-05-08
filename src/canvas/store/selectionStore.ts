import { createStore } from '../../utils/index.ts';
import type { Selection } from '../types/index.ts';

const createSelectionStore = () => {
  const { state, subscribe } = createStore<{ selection: Selection }>({
    selection: {
      hoveredIndex: -1,
      selectedIndices: [],
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
        selectedIndices: [index],
      };
    },
    setUnselect() {
      state.selection = {
        ...state.selection,
        selectedIndices: [],
      };
    },
    addSelect(index: number) {
      if (index === -1) return;

      if (!state.selection.selectedIndices.includes(index)) {
        state.selection = {
          ...state.selection,
          selectedIndices: [...state.selection.selectedIndices, index],
        };
      }
    },
    deleteSelect(index: number) {
      if (index === -1) return;

      if (state.selection.selectedIndices.includes(index)) {
        state.selection = {
          ...state.selection,
          selectedIndices: state.selection.selectedIndices.filter(selectedIndex => selectedIndex !== index),
        };
      }
    },
  };
};

export const selectionStore = createSelectionStore();
