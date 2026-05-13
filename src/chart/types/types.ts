import type { Circle } from '../../types/index.ts';

export type PopoverInfo = {
  x: number;
  y: number;
  value: number;
  name: string;
  index: number;
  opacity: number;
};

export type ChartData = Circle & {
  isActive?: boolean;
};

export type BarChartProps = {
  data: ChartData[];
  onBarClick?: (info: PopoverInfo | null) => void;
  onChartReady?: (controls: { redraw: () => void }) => void;
};
