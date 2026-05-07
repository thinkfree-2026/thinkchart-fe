import { ChartItem } from './ChartItem.tsx';
import { state, subscribe } from '../../store/chartListStore.ts';
import { createRef } from '../../utils';

export const ChartList = () => {
  const listRef = createRef<HTMLDivElement>(null);

  const renderList = () => {
    return (
      <>
        {state.charts.map(chart => (
          <ChartItem id={chart.id} label={chart.label} />
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
