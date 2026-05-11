import { createStore } from '../../utils/index.ts';

export const dataSettingsStore = createStore({
  showDataValues: false,
  showPercentage: false,
  showSum: false,
});

export const axisStore = createStore({
  showXAxisName: false,
  xAxisName: '',
  showYAxisName: false,
  yAxisName: '',
});
