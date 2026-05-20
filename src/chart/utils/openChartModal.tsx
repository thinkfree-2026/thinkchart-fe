import { api, type ApiResponse } from '../../api/http.ts';
import { modalRoot } from '../../main.ts';
import type { Chart } from '../../types';
import { ChartModal } from '../components/index.ts';
import { chartDataStore, chartStore, dataSettingsStore } from '../store/index.ts';

const { state: chartDataState } = chartDataStore;
const { state: chartState } = chartStore;
const { state: dataSettingState } = dataSettingsStore;

const initChartOption = () => {
  dataSettingState.showDataValues = true;
  dataSettingState.showPercentage = true;
  dataSettingState.showSum = true;

  chartState.showXAxisName = true;
  chartState.showYAxisName = true;
};

export const openChartModal = async (chartId: string) => {
  const chartRes: ApiResponse<Chart> = await api.get(`/canvas/charts/${chartId}`);

  const bars = chartRes.data.circles;
  chartDataState.data = bars.map(circle => ({
    ...circle,
    isActive: false,
  }));

  chartState.xAxisName = chartRes.data.xaxis;
  chartState.yAxisName = chartRes.data.yaxis;
  chartState.name = chartRes.data.name;
  chartState.unit = chartRes.data.unit;

  initChartOption();

  modalRoot.replaceChildren(<ChartModal chartId={chartId} />);
};
