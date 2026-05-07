import type { ChartListItem } from '../types/index.ts';
import { createStore } from '../utils/index.ts';

const charts = [
  { id: 'chart1', label: 'Chart1' },
  { id: 'chart2', label: 'Chart2' },
  { id: 'chart3', label: 'Chart3' },
  { id: 'chart4', label: 'Chart4' },
  { id: 'chart5', label: 'Chart5' },
];

export const { state, subscribe } = createStore<{
  activeId: string | null;
  charts: ChartListItem[];
}>({
  activeId: null,
  charts: charts,
});
