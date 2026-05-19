import { api } from '../../api/http.ts';
import { openChartModal } from '../../chart/utils/openChartModal.tsx';
import { chartListState } from '../../store/index.ts';
import { openToastMessage } from '../common/Toast.tsx';
import { toastRoot } from '../../main.ts';

type ChartItemProps = {
  id: string;
  label: string;
};

export const ChartItem = ({ id, label }: ChartItemProps) => {
  const handleClick = async () => {
    if (chartListState.activeId === id) return;
    chartListState.activeId = id;

    await openChartModal(id);
  };

  const handleDeleteClick = async (e: MouseEvent) => {
    e.stopPropagation();

    chartListState.charts = chartListState.charts.filter(chart => chart.id !== id);

    if (chartListState.activeId === id) {
      chartListState.activeId = null;
    }

    await api.delete(`/canvas/charts/${id}`).then(res => {
      openToastMessage({ dom: toastRoot, type: 'success', message: res.message });
    });
  };

  return (
    <div
      onclick={handleClick}
      class={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-caption transition ${
        chartListState.activeId === id ? 'bg-primary/10 font-semibold text-primary' : 'text-gray-500 hover:bg-gray-100'
      } `}
    >
      <span>{label}</span>
      <button
        type="button"
        class="cursor-pointer text-gray-400 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
        onclick={handleDeleteClick}
        aria-label="Delete Chart"
      >
        ✕
      </button>
    </div>
  );
};
