import type { Circle } from './commonAPI.ts';

export type ChartListItem = {
  id: string;
  name: string;
  circleIds: string[];
  createdAt: number;
  xaxis: string;
  yaxis: string;
  unit: string;
};

export type ChartList = ChartListItem[];

export type Chart = {
  chartId: string;
  name: string;
  circles: Circle[];
  xaxis: string;
  yaxis: string;
  unit: string;
};
