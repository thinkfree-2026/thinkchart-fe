import { api, type ApiResponse } from '../../api/http.ts';
import { ChartModal } from '../../chart/components/index.ts';
import { axisStore } from '../../chart/store/index.ts';
import { chartDataStore } from '../../chart/store/chartDataStore.ts';
import { modalRoot } from '../../main.ts';
import { state } from '../../store/chartListStore.ts';
import type { Chart } from '../../types/api/chartAPI.ts';

type ChartItemProps = {
  id: string;
  label: string;
};

export const ChartItem = ({ id, label }: ChartItemProps) => {
  const handleClick = async () => {
    if (state.activeId === id) return;
    state.activeId = id;

    const res: ApiResponse<Chart> = await api.get(`/canvas/charts/${id}`);

    const { state: chartDataState } = chartDataStore;
    const { state: axisState } = axisStore;

    const circles = res.data.circles;
    chartDataState.data = circles.map(circle => ({
      ...circle,
      isActive: false,
    }));

    axisState.xAxisName = res.data.xaxis;
    axisState.yAxisName = res.data.yaxis;

    modalRoot.replaceChildren(<ChartModal chartId={id} chartName={label} />);
  };

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();

    state.charts = state.charts.filter(chart => chart.id !== id);

    if (state.activeId === id) {
      state.activeId = null;
    }
  };

  return (
    <div
      onclick={handleClick}
      class={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-caption transition ${
        state.activeId === id ? 'bg-primary/10 font-semibold text-primary' : 'text-gray-500 hover:bg-gray-100'
      } `}
    >
      <span>{label}</span>
      <button
        type="button"
        class="text-gray-400 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
        onclick={handleDeleteClick}
        aria-label="Delete Chart"
      >
        ✕
      </button>
    </div>
  );
};
