import { chartControlsRef } from '../chart/components/index.ts';
import { chartDataStore } from '../chart/store/index.ts';
import { openToastMessage } from '../components/common/Toast.tsx';
import { toastLayerRef } from '../components/index.ts';

import { chartSocket } from './chartSocket.ts';

export const handleCharModalSocketMessage = (chartId: string) => {
  const { state: chartDataState } = chartDataStore;

  chartSocket.enterChartSession(chartId, message => {
    switch (message.action) {
      case 'CHART_BAR_UPDATED': {
        openToastMessage({ dom: toastLayerRef.current, type: 'success', message: '차트 데이터 값이 변경되었습니다.' });

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
        openToastMessage({ dom: toastLayerRef.current, type: 'success', message: '차트 바가 삭제되었습니다.' });

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
