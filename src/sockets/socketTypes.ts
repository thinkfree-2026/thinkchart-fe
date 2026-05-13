export type CursorResponse = {
  id: string;
  x: number;
  y: number;
  color: string;
};

export type CircleResponse = {
  id: string;
  chartId: string | null;
  name: string;
  x: number;
  y: number;
  value: number;
  color: string;
  opacity: number;
  createdAt: number;
};

export type ChartResponse = {
  id: string;
  name: string;
  circleIds: string[];
  xaxis: string;
  yaxis: string;
  createdAt: number;
};
