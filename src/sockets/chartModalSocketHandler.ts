import { chartControlsRef } from '../chart/components/index.ts';
import { chartDataStore } from '../chart/store/index.ts';

import { chartSocket } from './chartSocket.ts';

export const handleCharModalSocketMessage = (chartId: string) => {
  const { state: chartDataState } = chartDataStore;

  chartSocket.enterChartSession(chartId, message => {
    switch (message.action) {
      case 'CHART_BAR_UPDATED': {
        const updatedChartBar = message.payload;

        const target = chartDataState.data.find(data => data.id === updatedChartBar.circleId);

        if (!target) return;

        target.name = updatedChartBar.name;
        target.value = updatedChartBar.value;
        target.opacity = updatedChartBar.opacity;

        requestAnimationFrame(() => {
          chartControlsRef.current?.redraw();
        });
        break;
      }
      case 'CHART_BAR_DELETED': {
        const deleteChartBar = message.payload;

        const targetIndex = chartDataState.data.findIndex(data => data.id === deleteChartBar);

        if (targetIndex === -1) return;

        chartDataState.data.splice(targetIndex, 1);

        requestAnimationFrame(() => {
          chartControlsRef.current?.redraw();
        });

        break;
      }
      default:
        break;
    }
  });
};
