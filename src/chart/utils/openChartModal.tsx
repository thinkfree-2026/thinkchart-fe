import { api, type ApiResponse } from '../../api/http.ts';
import type { Chart } from '../../types';
import { chartDataStore, chartStore } from '../store/index.ts';
import { modalRoot } from '../../main.ts';
import { ChartModal } from '../components/index.ts';

export const openChartModal = async (chartId: string) => {
  const chartRes: ApiResponse<Chart> = await api.get(`/canvas/charts/${chartId}`);

  const { state: chartDataState } = chartDataStore;
  const { state: chartState } = chartStore;

  const bars = chartRes.data.circles;
  chartDataState.data = bars.map(circle => ({
    ...circle,
    isActive: false,
  }));

  chartState.xAxisName = chartRes.data.xaxis;
  chartState.yAxisName = chartRes.data.yaxis;
  chartState.name = chartRes.data.name;

  modalRoot.replaceChildren(<ChartModal chartId={chartId} />);
};
