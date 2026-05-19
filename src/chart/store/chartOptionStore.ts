import { createStore } from '../../utils/index.ts';

export const dataSettingsStore = createStore({
  showDataValues: true,
  showPercentage: true,
  showSum: true,
});

export const chartStore = createStore({
  name: '',
  showXAxisName: true,
  xAxisName: '',
  showYAxisName: true,
  yAxisName: '',
});
