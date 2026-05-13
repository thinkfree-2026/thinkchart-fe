import { modalRoot } from '../../main.ts';
import { state } from '../../store/chartListStore.ts';
import { ChartModal } from '../modal/index.ts';

type ChartItemProps = {
  id: string;
  label: string;
};

export const ChartItem = ({ id, label }: ChartItemProps) => {
  const handleClick = () => {
    if (state.activeId === id) return;
    state.activeId = id;
    modalRoot.replaceChildren(<ChartModal id={id} />);
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
