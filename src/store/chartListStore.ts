import type { ChartListItem } from '../types/api/chartAPI.ts';
import { createStore } from '../utils/index.ts';

export const { state: chartListState, subscribe } = createStore<{
  activeId: string | null;
  charts: ChartListItem[];
}>({
  activeId: null,
  charts: [],
});
