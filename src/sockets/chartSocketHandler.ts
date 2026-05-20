import { circleStore } from '../canvas/store/index.ts';
import { chartStore } from '../chart/store/index.ts';
import { openToastMessage } from '../components/common/Toast.tsx';
import { toastLayerRef } from '../components/index.ts';
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
        circleIds: string[];
        id: string;
      };
    };

export const handleChartSocketMessage = (message: ChartSocketMessage) => {
  switch (message.action) {
    case 'CHART_CREATED': {
      const chartId = message.payload.id;
      const usedCircleIds = message.payload.circleIds;
      circleStore.getCircles().forEach(circle => {
        if (usedCircleIds.includes(circle.id)) {
          circle.chartId = chartId;
        }
      });

      chartListState.charts = [...chartListState.charts, message.payload];

      break;
    }

    case 'CHART_UPDATED': {
      if (toastLayerRef.current) {
        openToastMessage({
          dom: toastLayerRef.current,
          type: 'success',
          message: '차트가 수정되었습니다.',
        });
      }

      const updatedChart = message.payload;
      const { state: chartState } = chartStore;

      chartListState.charts = chartListState.charts.map(chart =>
        chart.id === updatedChart.id ? { ...chart, name: updatedChart.name } : chart
      );

      chartState.xAxisName = updatedChart.xaxis;
      chartState.yAxisName = updatedChart.yaxis;
      chartState.name = updatedChart.name;

      const xAxisInput = document.getElementById(`${updatedChart.id}-axis-x-input`) as HTMLInputElement | null;
      if (xAxisInput) {
        xAxisInput.value = updatedChart.xaxis;
      }

      const yAxisInput = document.getElementById(`${updatedChart.id}-axis-y-input`) as HTMLInputElement | null;
      if (yAxisInput) {
        yAxisInput.value = updatedChart.yaxis;
      }

      const titleDisplay = document.getElementById(`${updatedChart.id}-chart-title-display`);
      if (titleDisplay) {
        titleDisplay.textContent = updatedChart.name;
      }

      const titleInput = document.getElementById(`${updatedChart.id}-chart-title-input`) as HTMLInputElement | null;
      if (titleInput) {
        titleInput.value = updatedChart.name;
      }

      break;
    }

    case 'CHART_DELETED': {
      const circleIds = message.payload.circleIds;
      circleIds.forEach(circleId => circleStore.updateCircleChartId(circleId));

      chartListState.charts = chartListState.charts.filter(chart => chart.id !== message.payload.id);

      break;
    }
  }
};
