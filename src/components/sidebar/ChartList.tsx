import { chartListState, subscribe } from '../../store/chartListStore.ts';
import { createRef } from '../../utils/index.ts';

import { ChartItem } from './ChartItem.tsx';

export const ChartList = () => {
  const listRef = createRef<HTMLDivElement>(null);

  const renderList = () => {
    return (
      <>
        {chartListState.charts.map(chart => (
          <ChartItem id={chart.id} label={chart.name} />
        ))}
      </>
    );
  };

  const rerender = () => {
    if (!listRef.current) return;
    listRef.current.replaceChildren(renderList());
  };

  subscribe('charts', rerender);
  subscribe('activeId', rerender);

  return (
    <div ref={listRef} class="flex flex-col gap-1">
      {renderList()}
    </div>
  );
};
