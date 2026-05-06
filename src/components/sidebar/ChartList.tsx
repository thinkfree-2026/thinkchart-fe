import { ChartItem } from './ChartItem.tsx';

type Chart = {
  id: string;
  label: string;
};

type ChartListProps = {
  charts: Chart[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export const ChartList = ({ charts, activeId, onSelect }: ChartListProps) => {
  return (
    <div class="flex flex-col gap-1">
      {charts.map(chart => (
        <ChartItem
          key={chart.id}
          label={chart.label}
          active={chart.id === activeId}
          onClick={() => onSelect(chart.id)}
        />
      ))}
    </div>
  );
};
