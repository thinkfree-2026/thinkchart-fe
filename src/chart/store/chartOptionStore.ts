import { createStore } from '../../utils/index.ts';

export const dataSettingsStore = createStore({
  showDataValues: false,
  showPercentage: false,
  showSum: false,
});

export const chartStore = createStore({
  name: '',
  showXAxisName: false,
  xAxisName: '',
  showYAxisName: false,
  yAxisName: '',
});
