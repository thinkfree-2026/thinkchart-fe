import { ChartItem } from './ChartItem.tsx';
import type { ChartListItem } from '../../types/index.ts';

type ChartListProps = {
  charts: ChartListItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export const ChartList = ({ charts, activeId, onSelect, onDelete }: ChartListProps) => {
  return (
    <div class="flex flex-col gap-1">
      {charts.map(chart => (
        <ChartItem
          id={chart.id}
          label={chart.label}
          isActive={chart.id === activeId}
          onSelect={() => onSelect(chart.id)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
