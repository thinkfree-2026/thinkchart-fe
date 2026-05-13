import { createStore } from '../../utils/index.ts';
import type { ChartData } from '../types/index.ts';

export const chartDataStore = createStore({
  data: [] as ChartData[],
});
