export type PopoverInfo = {
  x: number;
  y: number;
  value: number;
  label: string;
  index: number;
  opacity: number;
};

export type ChartData = {
  id: string;
  chartId: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  value: number;
  opacity: number;
  color: string;
  createdAt: number;
  isActive?: boolean;
};

export type ChartAxisSettings = {
  showXAxisName: boolean;
  xAxisName: string;
  showYAxisName: boolean;
  yAxisName: string;
};

export type ChartAxisDrawOptions = {
  showXLabel: boolean;
  xLabel: string;
  /** Y축 토글: 눈금(값) 표시, `yLabel`이 있으면 축 이름도 표시 */
  showYAxis: boolean;
  yLabel: string;
};

export type ChartAxisStore = {
  state: ChartAxisSettings;
  subscribe: <K extends keyof ChartAxisSettings>(key: K, listener: (value: ChartAxisSettings[K]) => void) => () => void;
};

export type ChartDataSettings = {
  showDataValues: boolean;
  showPercentage: boolean;
  showSum: boolean;
};

export type ChartDataDrawOptions = ChartDataSettings;

export type ChartDataStore = {
  state: ChartDataSettings;
  subscribe: <K extends keyof ChartDataSettings>(key: K, listener: (value: ChartDataSettings[K]) => void) => () => void;
};

export type BarChartProps = {
  data: ChartData[];
  onBarClick?: (info: PopoverInfo | null) => void;
  onChartReady?: (controls: { redraw: () => void }) => void;
};
