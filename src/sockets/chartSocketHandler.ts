import { chartListState } from '../store/index.ts';
import type { ChartListItem } from '../types/index.ts';

export type ChartSocketMessage =
  | {
      action: 'CHART_CREATED' | 'CHART_UPDATED';
      payload: ChartListItem;
    }
  | {
      action: 'CHART_DELETED';
      payload: {
        id: string;
      };
    };

export const handleChartSocketMessage = (message: ChartSocketMessage) => {
  switch (message.action) {
    case 'CHART_CREATED': {
      chartListState.charts = [...chartListState.charts, message.payload];

      break;
    }

    case 'CHART_UPDATED': {
      chartListState.charts = chartListState.charts.map(chart =>
        chart.id === message.payload.id
          ? {
              ...chart,
              name: message.payload.name,
            }
          : chart
      );

      break;
    }

    case 'CHART_DELETED': {
      chartListState.charts = chartListState.charts.filter(chart => chart.id !== message.payload.id);

      break;
    }
  }
};
