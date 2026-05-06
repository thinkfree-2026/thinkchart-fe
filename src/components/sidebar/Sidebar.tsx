import { ChartList } from './ChartList.tsx';
import { createRef, createStore } from '../../utils/index.ts';
import type { ChartListItem } from '../../types/index.ts';

const charts = [
  { id: 'chart1', label: 'Chart1' },
  { id: 'chart2', label: 'Chart2' },
  { id: 'chart3', label: 'Chart3' },
  { id: 'chart4', label: 'Chart4' },
  { id: 'chart5', label: 'Chart5' },
];

export const Sidebar = () => {
  const { state, subscribe } = createStore<{
    activeId: string | null;
    charts: ChartListItem[];
  }>({
    activeId: null,
    charts: charts,
  });

  const listRef = createRef<HTMLElement | null>(null);

  const handleChartSelect = (id: string | null) => {
    state.activeId = id;
  };

  const handleChartDelete = (id: string) => {
    state.charts = state.charts.filter(chart => chart.id !== id);

    if (state.activeId === id) {
      state.activeId = null;
    }
  };

  const renderList = () => {
    return (
      <ChartList
        charts={state.charts}
        activeId={state.activeId}
        onSelect={handleChartSelect}
        onDelete={handleChartDelete}
      />
    );
  };

  const rerender = () => {
    if (!listRef.current) return;
    listRef.current.replaceChildren(renderList());
  };

  subscribe('charts', rerender);
  subscribe('activeId', rerender);

  return (
    <div class="fixed flex h-screen">
      <div class="my-3 ml-3 flex w-60 flex-col gap-6 rounded-3xl bg-white/90 px-5 py-6 shadow-2xl">
        <div class="px-2">
          <div class="font-bold text-primary">ThinkChart</div>
          <div class="mt-1 text-caption text-gray-300">Collaborative Space</div>
        </div>
        <div ref={listRef}>{renderList()}</div>
      </div>
    </div>
  );
};
